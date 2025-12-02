"""
BruteForceParser - Line-by-line regex-based PDF transaction extraction.

This parser does NOT rely on table extraction. Instead, it:
1. Extracts raw text from all pages
2. Identifies section types (Deposits vs Withdrawals) via keywords
3. Scans every line with regex to find transaction patterns
4. Returns DataFrame or raises specific error if no transactions found
"""

import pdfplumber
import pandas as pd
import re
from datetime import datetime


class BruteForceParser:
    """
    Regex-based parser that ignores table structure and parses raw text lines.
    """
    
    # Regex pattern to capture: Date (MM/DD) + Amount + Description
    # Pattern: ^(\d{2}/\d{2})\s+([$]?[\d,]+\.\d{2})\s+(.*)$
    # Example matches:
    #   "12/15 1,234.56 GROCERY STORE"
    #   "01/03 $50.00 ATM WITHDRAWAL"
    TRANSACTION_PATTERN = re.compile(r'^(\d{2}/\d{2})\s+([$]?[\d,]+\.\d{2})\s+(.+)$')
    
    def __init__(self):
        self.year = datetime.now().year
        self.transactions = []
        self.current_multiplier = 0  # State: +1 (deposit) or -1 (withdrawal)
    
    def extract_statement_year(self, text):
        """
        Extract year from first page text.
        """
        if not text:
            return self.year
        
        # Look for 4-digit year in first 500 characters
        year_match = re.search(r'\b(20\d{2}|19\d{2})\b', text[:500])
        if year_match:
            return int(year_match.group(1))
        
        return self.year
    
    def parse(self, file_path):
        """
        Main parsing function using regex line-by-line extraction.
        
        Returns:
            pandas.DataFrame with columns: [date, amount, description, source]
        
        Raises:
            ValueError: If no transactions found (specific error message)
        """
        self.transactions = []
        self.current_multiplier = 0
        
        try:
            with pdfplumber.open(file_path) as pdf:
                if not pdf.pages:
                    raise ValueError("PDF is empty - no pages found")
                
                # Extract year from first page
                first_page_text = pdf.pages[0].extract_text() or ""
                self.year = self.extract_statement_year(first_page_text)
                print(f"[BruteForceParser] Detected Year: {self.year}")
                
                # Process all pages
                for page_num, page in enumerate(pdf.pages):
                    page_text = page.extract_text()
                    
                    if not page_text:
                        print(f"[BruteForceParser] Page {page_num + 1}: No text found")
                        continue
                    
                    print(f"[BruteForceParser] Processing Page {page_num + 1}/{len(pdf.pages)}")
                    self._process_page_text(page_text, page_num)
                
                # Check if we found any transactions
                if not self.transactions:
                    # Provide context on what was parsed to help debugging
                    first_100_chars = first_page_text[:100].replace('\n', ' ') if first_page_text else "No text extracted"
                    raise ValueError(f"Parsed 0 transactions. Text content: {first_100_chars}...")
                
                # Convert to DataFrame with error handling
                print(f"[BruteForceParser] Converting {len(self.transactions)} transactions to DataFrame", flush=True)
                try:
                    df = pd.DataFrame(self.transactions)
                    print(f"[BruteForceParser] DataFrame created successfully, shape: {df.shape}", flush=True)
                    
                    if not df.empty:
                        print(f"[BruteForceParser] Sorting DataFrame by date", flush=True)
                        # Sort by date (dates are already strings in YYYY-MM-DD format)
                        df = df.sort_values(by='date').reset_index(drop=True)
                        print(f"[BruteForceParser] Sorting completed", flush=True)
                    
                    print(f"[BruteForceParser] Successfully extracted {len(df)} transactions", flush=True)
                    return df
                    
                except Exception as e:
                    print(f"[BruteForceParser] ERROR in DataFrame operations: {type(e).__name__}: {str(e)}", flush=True)
                    import traceback
                    traceback.print_exc()
                    raise ValueError(f"DataFrame operation failed: {str(e)}")
                
        except ValueError:
            # Re-raise ValueError with specific message
            raise
        except Exception as e:
            raise ValueError(f"BruteForce parsing failed: {str(e)}")
    
    def _process_page_text(self, page_text, page_num):
        """
        Process text from a single page line-by-line.
        """
        lines = page_text.split('\n')
        
        for line_num, line in enumerate(lines):
            line_stripped = line.strip()
            
            if not line_stripped:
                continue
            
            # Step 1: Check for section headers (state changes)
            self._check_section_header(line_stripped)
            
            # Step 2: Skip if we hit balance detail section
            if self._is_balance_section(line_stripped):
                print(f"[BruteForceParser] Page {page_num + 1}: Stopping at 'Daily Balance Detail'")
                break
            
            # Step 3: Try to match transaction pattern
            if self.current_multiplier != 0:
                self._try_extract_transaction(line_stripped, line_num, page_num)
    
    def _check_section_header(self, line):
        """
        Identify section type and set multiplier.
        """
        line_lower = line.lower()
        
        # Deposits/Credits section
        if any(keyword in line_lower for keyword in ['deposits', 'additions', 'credits']):
            if self.current_multiplier != 1.0:
                print(f"[BruteForceParser] Section detected: DEPOSITS (multiplier = +1.0)")
                self.current_multiplier = 1.0
        
        # Withdrawals/Debits section
        elif any(keyword in line_lower for keyword in ['withdrawals', 'deductions', 'checks paid', 'purchase']):
            if self.current_multiplier != -1.0:
                print(f"[BruteForceParser] Section detected: WITHDRAWALS (multiplier = -1.0)")
                self.current_multiplier = -1.0
    
    def _is_balance_section(self, line):
        """
        Check if we've reached the balance summary section (should stop parsing).
        """
        line_lower = line.lower()
        return 'daily balance' in line_lower or 'balance detail' in line_lower
    
    def _try_extract_transaction(self, line, line_num, page_num):
        """
        Try to extract a transaction from a line using regex.
        """
        match = self.TRANSACTION_PATTERN.match(line)
        
        if match:
            date_str = match.group(1)  # MM/DD
            amount_str = match.group(2)  # Amount with commas and optional $
            description = match.group(3).strip()  # Description
            
            # Skip if description looks like a total row
            if description.lower() in ['total', 'totals', 'subtotal']:
                return
            
            try:
                # Parse date
                date_obj = datetime.strptime(f"{date_str}/{self.year}", "%m/%d/%Y")
                formatted_date = date_obj.strftime("%Y-%m-%d")
                
                # Parse amount (remove $ and ,)
                clean_amount_str = amount_str.replace('$', '').replace(',', '')
                amount = float(clean_amount_str)
                final_amount = abs(amount) * self.current_multiplier
                
                # Add transaction (use formatted_date string, not date_obj)
                self.transactions.append({
                    'date': formatted_date,  # FIX: Use string instead of datetime object
                    'description': description,
                    'amount': final_amount,
                    'source': 'PDF'
                })
                
                print(f"[BruteForceParser] Page {page_num + 1}, Line {line_num}: Found transaction: {formatted_date} | ${final_amount:.2f} | {description[:30]}")
                
            except (ValueError, TypeError) as e:
                # Failed to parse date or amount
                print(f"[BruteForceParser] Page {page_num + 1}, Line {line_num}: Regex matched but failed to parse: {e}")
