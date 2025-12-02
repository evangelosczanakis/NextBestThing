import pdfplumber
import pandas as pd
import re
from datetime import datetime


class GenericPDFParser:
    """
    Robust, loose extraction logic that finds ANY transaction table in a PDF.
    Uses state-machine logic: detect Header -> extract Rows.
    """
    
    def __init__(self):
        self.year = datetime.now().year
        self.transactions = []
    
    def extract_statement_year(self, text):
        """
        Step 1: Extract Statement Year from first page.
        Regex search for "Period XX/XX/YYYY" or any 4-digit year.
        Defaults to current year if not found.
        """
        if not text:
            return self.year
        
        # Look for "Period" followed by a date pattern
        period_match = re.search(r"Period.*?(\d{1,2}/\d{1,2}/(\d{4}))", text, re.IGNORECASE)
        if period_match:
            return int(period_match.group(2))
        
        # Look for any 4-digit year in the first 500 characters
        year_match = re.search(r"\b(20\d{2}|19\d{2})\b", text[:500])
        if year_match:
            return int(year_match.group(1))
        
        return self.year
    
    def determine_sign_multiplier(self, text_above):
        """
        Step 5: Determine Sign (+/-) based on text preceding the table.
        
        Returns:
            1.0 for deposits/credits
            -1.0 for withdrawals/debits
            0 if unclear (table will be skipped)
        """
        text_lower = text_above.lower()
        
        # Positive keywords (deposits/credits)
        positive_keywords = ["deposits", "additions", "credits", "payments received", "income"]
        if any(keyword in text_lower for keyword in positive_keywords):
            return 1.0
        
        # Negative keywords (withdrawals/debits)
        negative_keywords = ["withdrawals", "deductions", "debits", "checks", "purchases", "fees", "subtractions"]
        if any(keyword in text_lower for keyword in negative_keywords):
            return -1.0
        
        return 0
    
    def is_transaction_table(self, headers):
        """
        Step 4: Inspect the Header Row to determine if this is a transaction table.
        
        Returns:
            True if headers contain ["Date", "Amount", "Description"]
            False if headers contain ["Date", "Balance"] (daily balance summary)
        """
        if not headers:
            return False
        
        # Normalize headers
        headers_lower = [str(h).lower().strip() if h else "" for h in headers]
        headers_str = " ".join(headers_lower)
        
        # SKIP: Daily balance summaries
        if "date" in headers_str and "balance" in headers_str and "description" not in headers_str:
            return False
        
        # PROCESS: Transaction tables
        if "date" in headers_str and ("amount" in headers_str or "description" in headers_str):
            return True
        
        return False
    
    def clean_amount(self, amount_str):
        """
        Step 6: Data Cleaning - Remove "$" and "," from Amount.
        """
        if not amount_str:
            return None
        
        cleaned = str(amount_str).replace("$", "").replace(",", "").replace(" ", "").strip()
        
        # Handle parentheses notation for negative numbers (e.g., "(100.00)")
        if cleaned.startswith("(") and cleaned.endswith(")"):
            cleaned = "-" + cleaned[1:-1]
        
        try:
            return float(cleaned)
        except ValueError:
            return None
    
    def parse_date(self, date_str):
        """
        Step 6: Data Cleaning - Combine "Date" (MM/DD) with extracted Year to form YYYY-MM-DD.
        """
        if not date_str:
            return None
        
        date_str = str(date_str).strip()
        
        try:
            # MM/DD format (most common)
            if re.match(r"^\d{1,2}/\d{1,2}$", date_str):
                date_obj = datetime.strptime(f"{date_str}/{self.year}", "%m/%d/%Y")
                return date_obj.strftime("%Y-%m-%d")
            
            # MM/DD/YYYY format
            elif re.match(r"^\d{1,2}/\d{1,2}/\d{4}$", date_str):
                date_obj = datetime.strptime(date_str, "%m/%d/%Y")
                return date_obj.strftime("%Y-%m-%d")
            
            # MM/DD/YY format
            elif re.match(r"^\d{1,2}/\d{1,2}/\d{2}$", date_str):
                date_obj = datetime.strptime(date_str, "%m/%d/%y")
                return date_obj.strftime("%Y-%m-%d")
            
            # YYYY-MM-DD format (already formatted)
            elif re.match(r"^\d{4}-\d{1,2}-\d{1,2}$", date_str):
                date_obj = datetime.strptime(date_str, "%Y-%m-%d")
                return date_obj.strftime("%Y-%m-%d")
            
        except ValueError:
            return None
        
        return None
    
    def is_valid_transaction_row(self, row, description):
        """
        Step 6: Filter out rows where Description is empty or "Total".
        """
        if not description or description.strip() == "":
            return False
        
        description_lower = description.lower().strip()
        
        # Skip total rows
        if description_lower in ["total", "totals", "subtotal", "balance"]:
            return False
        
        return True
    
    def parse_statement_loose(self, file_path):
        """
        Main parsing function that implements the complete state-machine logic.
        
        Returns:
            pandas.DataFrame with columns: [date, amount, description, category]
            Empty DataFrame if no transactions found
        """
        self.transactions = []
        
        try:
            with pdfplumber.open(file_path) as pdf:
                if not pdf.pages:
                    print("WARNING: PDF is empty")
                    return pd.DataFrame(columns=["date", "amount", "description", "category"])
                
                # Step 1: Extract Statement Year from first page
                first_page_text = pdf.pages[0].extract_text() or ""
                self.year = self.extract_statement_year(first_page_text)
                print(f"[GenericPDFParser] Detected Year: {self.year}")
                
                # Step 2: Iterate through all pages
                for page_num, page in enumerate(pdf.pages):
                    print(f"[GenericPDFParser] Processing Page {page_num + 1}/{len(pdf.pages)}")
                    
                    # Step 3: Extract ALL tables (no strict bounding boxes)
                    try:
                        tables = page.extract_tables()
                    except Exception as e:
                        print(f"WARNING: Failed to extract tables from page {page_num + 1}: {e}")
                        continue
                    
                    if not tables:
                        print(f"[GenericPDFParser] No tables found on page {page_num + 1}")
                        continue
                    
                    print(f"[GenericPDFParser] Found {len(tables)} table(s) on page {page_num + 1}")
                    
                    # Process each table
                    for table_idx, table in enumerate(tables):
                        try:
                            self._process_table(page, table, table_idx, page_num)
                        except Exception as e:
                            print(f"WARNING: Failed to process table {table_idx + 1} on page {page_num + 1}: {e}")
                            continue
                
                # Step 7: Return DataFrame
                if not self.transactions:
                    print("[GenericPDFParser] No transactions found")
                    return pd.DataFrame(columns=["date", "amount", "description", "category"])
                
                df = pd.DataFrame(self.transactions)
                df = df.sort_values(by="date").reset_index(drop=True)
                print(f"[GenericPDFParser] Successfully extracted {len(df)} transactions")
                
                return df
                
        except Exception as e:
            print(f"ERROR: Critical failure in parse_statement_loose: {e}")
            return pd.DataFrame(columns=["date", "amount", "description", "category"])
    
    def _process_table(self, page, table, table_idx, page_num):
        """
        Process a single table from a page.
        """
        if not table or len(table) == 0:
            return
        
        # Step 4: Inspect Header Row (row 0)
        header_row = table[0]
        
        if not self.is_transaction_table(header_row):
            print(f"[GenericPDFParser] Skipping table {table_idx + 1} (not a transaction table)")
            return
        
        print(f"[GenericPDFParser] Processing transaction table {table_idx + 1}")
        
        # Step 5: Determine Sign - Look at text preceding the table
        try:
            # Get the full page text
            page_text = page.extract_text() or ""
            
            # For simplicity, check the entire page text for context
            # A more sophisticated approach would crop the area above the table
            multiplier = self.determine_sign_multiplier(page_text)
            
            if multiplier == 0:
                print(f"WARNING: Could not determine sign for table {table_idx + 1}, defaulting to +1.0")
                multiplier = 1.0
            
            print(f"[GenericPDFParser] Sign multiplier: {multiplier}")
            
        except Exception as e:
            print(f"WARNING: Failed to determine sign for table {table_idx + 1}: {e}, defaulting to +1.0")
            multiplier = 1.0
        
        # Process data rows (skip header)
        for row_idx, row in enumerate(table[1:], start=1):
            try:
                self._process_row(row, multiplier, row_idx, table_idx)
            except Exception as e:
                print(f"WARNING: Failed to process row {row_idx} in table {table_idx + 1}: {e}")
                continue
    
    def _process_row(self, row, multiplier, row_idx, table_idx):
        """
        Process a single row from a table.
        """
        # Remove None/empty cells
        clean_row = [cell for cell in row if cell and str(cell).strip()]
        
        if len(clean_row) < 2:
            return  # Not enough data
        
        # Assume structure: [Date, ...Description..., Amount]
        date_str = clean_row[0]
        amount_str = clean_row[-1]
        
        # Description is everything in between
        if len(clean_row) > 2:
            description = " ".join(str(cell).strip() for cell in clean_row[1:-1])
        else:
            description = "Transaction"  # Fallback if only date and amount
        
        # Step 6: Data Cleaning
        parsed_date = self.parse_date(date_str)
        if not parsed_date:
            return  # Invalid date
        
        amount = self.clean_amount(amount_str)
        if amount is None:
            return  # Invalid amount
        
        # Apply multiplier
        final_amount = abs(amount) * multiplier
        
        # Filter out invalid rows
        if not self.is_valid_transaction_row(row, description):
            return
        
        # Add transaction
        self.transactions.append({
            "date": parsed_date,
            "amount": final_amount,
            "description": description.strip(),
            "category": "Uncategorized"
        })


# Usage Example:
# parser = GenericPDFParser()
# df = parser.parse_statement_loose("path/to/statement.pdf")
# print(df)
