import pdfplumber
import re
from datetime import datetime
import pandas as pd

def parse_pnc_statement(file_path):
    """
    Parses a PNC PDF statement using a state machine approach.
    
    Args:
        file_path (str): Path to the PDF file.
        
    Returns:
        dict: {
            "filename": str,
            "ending_balance": float,
            "transactions": list[dict]
        }
    """
    transactions = []
    current_multiplier = 1.0 # Default to Deposits
    in_balance_section = False
    year = datetime.now().year # Default year
    ending_balance = 0.0
    
    # Regex for transaction lines: Date (MM/DD) + Amount + Description
    # Matches: "08/26 175.00 Direct Deposit..."
    # Note: ^\s* allows for indentation
    transaction_pattern = re.compile(r'^\s*(\d{2}/\d{2})\s+([$]?[\d,]+\.\d{2})\s+(.*)$')
    
    try:
        with pdfplumber.open(file_path) as pdf:
            if not pdf.pages:
                raise ValueError("PDF is empty")
                
            # --- Step 1: Extract Ending Balance (Multi-Page Scan) ---
            balance_found = False
            for page in pdf.pages:
                if balance_found:
                    break
                try:
                    tables = page.extract_tables()
                    for table in tables:
                        df = pd.DataFrame(table)
                        # Search for "Ending balance" in any cell
                        for r_idx, row in df.iterrows():
                            for c_idx, cell in enumerate(row):
                                if cell and "ending balance" in str(cell).lower():
                                    # Try to find the value in the next column
                                    if c_idx + 1 < len(row):
                                        val_str = str(row[c_idx + 1])
                                        # Clean and parse
                                        clean_val = val_str.replace('$', '').replace(',', '').strip()
                                        try:
                                            ending_balance = float(clean_val)
                                            print(f"[DEBUG] Found ending balance: {ending_balance}")
                                            balance_found = True
                                            break
                                        except ValueError:
                                            pass
                            if balance_found: break
                        if balance_found: break
                except Exception as e:
                    print(f"[WARNING] Could not extract ending balance from table on page {page.page_number}: {e}")

            # --- Step 2: Extract Year ---
            first_page_text = pdf.pages[0].extract_text() or ""
            year_match = re.search(r'\b(20\d{2})\b', first_page_text[:500])
            if year_match:
                year = int(year_match.group(1))
            
            # --- Step 3: Parse Transactions ---
            for page in pdf.pages:
                text = page.extract_text()
                if not text:
                    continue
                    
                lines = text.split('\n')
                for line in lines:
                    line_lower = line.lower()
                    
                    # State Machine: Check for section headers
                    if "deposits and other additions" in line_lower:
                        current_multiplier = 1.0
                        in_balance_section = False # Reset balance section flag
                        continue
                    elif any(x in line_lower for x in ["banking/debit card withdrawals", "deductions", "checks paid", "purchase", "online and electronic banking deductions"]):
                        current_multiplier = -1.0
                        in_balance_section = False # Reset balance section flag
                        continue
                    elif "daily balance detail" in line_lower:
                        in_balance_section = True
                        continue
                        
                    # If in balance section, skip transaction parsing
                    if in_balance_section:
                        continue
                        
                    # Try to match transaction
                    match = transaction_pattern.match(line)
                    if match:
                        date_str = match.group(1)
                        amount_str = match.group(2)
                        raw_description = match.group(3).strip()
                        
                        # Skip totals/subtotals if they accidentally match
                        if "total" in raw_description.lower():
                            continue
                            
                        try:
                            # Parse Amount
                            clean_amount = amount_str.replace('$', '').replace(',', '')
                            amount = float(clean_amount)
                            final_amount = abs(amount) * current_multiplier
                            
                            # Parse Date
                            date_obj = datetime.strptime(f"{date_str}/{year}", "%m/%d/%Y")
                            formatted_date = date_obj.strftime("%Y-%m-%d")
                            
                            # Clean Description
                            description = raw_description
                            for prefix in ["Direct Deposit -", "Debit Card Purchase", "Web Pmt-", "POS Purchase", "Recurring Debit Card"]:
                                description = description.replace(prefix, "").strip()
                            
                            # Determine type
                            tx_type = "INCOME" if final_amount > 0 else "EXPENSE"
                            
                            transactions.append({
                                "date": formatted_date,
                                "amount": abs(final_amount), # Frontend expects positive amount + type
                                "description": description,
                                "type": tx_type,
                                "category": "Uncategorized", # Placeholder
                                "source": "pdf"
                            })
                        except ValueError:
                            continue # Skip lines that look like tx but fail parsing

        if not transactions:
            raise ValueError("Parsing failed - No data found")
            
        return {
            "filename": str(file_path),
            "ending_balance": ending_balance,
            "transactions": transactions
        }

    except Exception as e:
        print(f"[PNC Parser Error] {e}")
        raise ValueError(f"Parsing failed: {str(e)}")
