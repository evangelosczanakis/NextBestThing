import pdfplumber
import pandas as pd
import re
from datetime import datetime

class GenericParser:
    def __init__(self):
        self.year = datetime.now().year

    def extract_statement_year(self, text):
        """
        Attempt to extract a year from the text.
        """
        if not text:
            return self.year
            
        # Look for date ranges or specific year patterns
        # "For the period ... 2025"
        match = re.search(r"(\d{4})", text)
        if match:
            return int(match.group(1))
            
        return self.year

    def parse(self, file_path):
        """
        Parses the PDF using spatial analysis to find transaction tables.
        """
        all_transactions = []
        
        with pdfplumber.open(file_path) as pdf:
            if len(pdf.pages) == 0:
                raise ValueError("PDF is empty")

            # Try to get year from first page
            first_page_text = pdf.pages[0].extract_text()
            self.year = self.extract_statement_year(first_page_text)
            
            print(f"DEBUG: GenericParser started. Year detected: {self.year}")

            for page_num, page in enumerate(pdf.pages):
                # Find tables
                tables = page.find_tables()
                print(f"DEBUG: Page {page_num} tables found: {len(tables) if tables else 0}")
                
                for table in tables:
                    bbox = table.bbox
                    # bbox: (x0, top, x1, bottom)
                    
                    # Identify section by looking at text above the table
                    # We look up to 150 units above the table
                    top_search_area = max(0, bbox[1] - 150)
                    search_bbox = (0, top_search_area, page.width, bbox[1])
                    
                    try:
                        text_above = page.crop(search_bbox).extract_text() or ""
                    except Exception:
                        text_above = ""
                        
                    text_above_lower = text_above.lower()
                    
                    # Determine multiplier based on keywords
                    current_multiplier = 0
                    
                    # Income Keywords
                    if any(x in text_above_lower for x in ["deposits", "additions", "credits", "payments received", "income"]):
                        current_multiplier = 1
                    # Expense Keywords
                    elif any(x in text_above_lower for x in ["withdrawals", "debits", "checks", "deductions", "purchases", "fees", "subtractions"]):
                        current_multiplier = -1
                        
                    # Also check the first row of the table itself (header row)
                    data = table.extract()
                    if not data:
                        continue
                        
                    first_row_str = " ".join([str(x) for x in data[0] if x]).lower()
                    
                    # If we didn't find it above, check the header row
                    if current_multiplier == 0:
                        if any(x in first_row_str for x in ["deposits", "additions", "credits", "payments received"]):
                            current_multiplier = 1
                        elif any(x in first_row_str for x in ["withdrawals", "debits", "checks", "deductions", "purchases"]):
                            current_multiplier = -1
                    
                    # If header row matches, we should skip it
                    if any(x in first_row_str for x in ["date", "description", "amount", "deposits", "withdrawals"]):
                        data = data[1:]

                    if current_multiplier == 0:
                        # Skip this table if we can't identify it as income or expense
                        print(f"DEBUG: Skipping table (unknown type). Header: {first_row_str[:50]}")
                        continue

                    # Debug
                    print(f"DEBUG: Table bbox: {bbox}")
                    print(f"DEBUG: Text above: '{text_above}'")
                    print(f"DEBUG: Multiplier: {current_multiplier}")

                    # Process Rows
                    for row in data:
                        clean_row = [x for x in row if x]
                        
                        # Need at least Date and Amount
                        if len(clean_row) < 2:
                            continue
                            
                        date_str = str(clean_row[0]).strip()
                        print(f"DEBUG: Processing row date: {date_str}")
                        
                        # Basic Date Validation (MM/DD or MM/DD/YYYY or YYYY-MM-DD)
                        # We'll just check if it starts with a digit
                        if not re.match(r"^\d", date_str):
                            print("DEBUG: Skipped (not a date)")
                            continue
                            
                        # Amount is usually the last column
                        amount_str = str(clean_row[-1]).strip()
                        
                        # Description is everything in between
                        description = " ".join([str(x) for x in clean_row[1:-1]])
                        description = description.replace("\n", " ").strip()
                        
                        try:
                            # Parse Date
                            # Try MM/DD first (most common in statements)
                            if re.match(r"^\d{1,2}/\d{1,2}$", date_str):
                                date_obj = datetime.strptime(f"{date_str}/{self.year}", "%m/%d/%Y")
                            elif re.match(r"^\d{1,2}/\d{1,2}/\d{2,4}$", date_str):
                                # Handle 2 digit year
                                if len(date_str.split('/')[-1]) == 2:
                                    date_obj = datetime.strptime(date_str, "%m/%d/%y")
                                else:
                                    date_obj = datetime.strptime(date_str, "%m/%d/%Y")
                            else:
                                # Try generic parse or skip
                                continue

                            # Parse Amount
                            amount_clean = amount_str.replace("$", "").replace(",", "").replace(" ", "")
                            # Handle negative signs in amount string if present (some banks do "-100.00")
                            amount = float(amount_clean)
                            
                            # Apply multiplier (if amount is already negative, this might flip it, 
                            # but usually bank statements show positive numbers in "Withdrawals" section.
                            # If the number is explicitly negative in a withdrawal section, it might be a refund (positive).
                            # Let's assume the section defines the sign, unless the number itself is negative.
                            # Actually, usually "Withdrawals" section lists positive numbers that are subtractions.
                            # So multiplier -1 is correct.
                            final_amount = abs(amount) * current_multiplier
                            
                            all_transactions.append({
                                "date": date_obj,
                                "description": description,
                                "amount": final_amount,
                                "source": "PDF"
                            })
                        except ValueError:
                            continue

        df = pd.DataFrame(all_transactions)
        if not df.empty:
            df = df.sort_values(by="date")
            
        return df
