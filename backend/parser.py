import pdfplumber
import re
from datetime import datetime

def parse_amount(amount_str):
    """
    Parses amount string like '1,234.56' to float 1234.56
    """
    try:
        return float(amount_str.replace(',', ''))
    except ValueError:
        return 0.0

def extract_transactions(pdf_path):
    """
    Extracts transactions from a PNC Bank PDF statement.
    """
    transactions = []
    meta = {
        "period": "Unknown",
        "ending_balance": 0.0
    }
    
    current_mode = None # "INCOME" or "EXPENSE"
    
    # Regex for transaction line: Date (MM/DD)  Amount  Description
    # Example: 10/01 197.90 FD SPTSBK CASINO
    # Note: PNC sometimes puts amount before description or vice versa depending on section, 
    # but the spec says: `^(\d{2}/\d{2})\s+([\d,]+\.\d{2})\s+(.*)`
    # We will stick to the spec but be robust.
    tx_pattern = re.compile(r'^(\d{2}/\d{2})\s+([\d,]+\.\d{2})\s+(.*)')
    
    # Regex for Ending Balance in summary table
    # Looking for "Ending balance" followed by amount
    summary_pattern = re.compile(r'Ending balance.*\$([\d,]+\.\d{2})', re.IGNORECASE)

    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if not text:
                    continue
                
                lines = text.split('\n')
                
                # Simple iterator to handle multi-line descriptions
                i = 0
                while i < len(lines):
                    line = lines[i].strip()
                    
                    # 1. Detect Mode (Section Headers)
                    if "Deposits and Other Additions" in line:
                        current_mode = "INCOME"
                        i += 1
                        continue
                    elif "Banking/Debit Card Withdrawals" in line or "Online and Electronic Banking Deductions" in line:
                        current_mode = "EXPENSE"
                        i += 1
                        continue
                    elif "Daily Balance Detail" in line:
                        # End of transaction sections usually
                        current_mode = None
                        i += 1
                        continue

                    # 2. Extract Summary (Ending Balance)
                    # This might be in a specific table header/row structure
                    # We'll try a simple regex search on the line first
                    summary_match = summary_pattern.search(line)
                    if summary_match:
                        meta["ending_balance"] = parse_amount(summary_match.group(1))

                    # 3. Extract Transactions
                    if current_mode:
                        match = tx_pattern.match(line)
                        if match:
                            date_str = match.group(1)
                            amount_str = match.group(2)
                            desc = match.group(3)
                            
                            # Handle multi-line description
                            # Look ahead to next line
                            if i + 1 < len(lines):
                                next_line = lines[i+1].strip()
                                # If next line doesn't start with a date and isn't a header/empty
                                if not tx_pattern.match(next_line) and \
                                   "Deposits and Other Additions" not in next_line and \
                                   "Banking/Debit Card Withdrawals" not in next_line and \
                                   "Online and Electronic Banking Deductions" not in next_line and \
                                   "Daily Balance Detail" not in next_line and \
                                   next_line:
                                    desc += " " + next_line
                                    i += 1 # Skip next line since we consumed it
                            
                            # Cleaning Rules
                            desc = desc.replace("Direct Deposit -", "").strip()
                            desc = desc.replace("Debit Card Purchase", "").strip()
                            desc = desc.replace("Web Pmt- Payment", "").strip()
                            
                            # Date formatting (Assume current year 2025 as per spec)
                            # Spec says: Convert dates from "MM/DD" to "2025-MM-DD"
                            try:
                                # We'll just prepend 2025- for now
                                # Ideally we'd infer year from statement period
                                formatted_date = f"2025-{date_str.replace('/', '-')}"
                            except:
                                formatted_date = date_str

                            transactions.append({
                                "date": formatted_date,
                                "amount": parse_amount(amount_str),
                                "desc": desc,
                                "type": current_mode
                            })
                    
                    i += 1
                    
    except Exception as e:
        print(f"Error parsing PDF: {e}")
        return {"meta": meta, "transactions": []}

    return {"meta": meta, "transactions": transactions}
