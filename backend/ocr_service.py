import re
import os
from datetime import datetime
try:
    from paddleocr import PaddleOCR
except ImportError:
    PaddleOCR = None

class ReceiptScanner:
    def __init__(self):
        # Initialize PaddleOCR
        # We use a try-except block to handle cases where dependencies might be missing in some environments
        if PaddleOCR:
            self.ocr = PaddleOCR(use_angle_cls=True, lang='en', show_log=False)
        else:
            self.ocr = None
            print("Warning: PaddleOCR not installed. OCR functionality will be limited.")

    def scan_receipt_image(self, image_path):
        """
        Scans a receipt image and extracts key information.
        
        Args:
            image_path (str): Path to the image file.
            
        Returns:
            dict: Extracted data including merchant, date, total, and items.
        """
        if not self.ocr:
            return {"error": "OCR engine not available"}

        # Step 1: Run local OCR (PaddleOCR)
        try:
            result = self.ocr.ocr(image_path, cls=True)
        except Exception as e:
            return {"error": f"OCR processing failed: {str(e)}"}
        
        if not result or not result[0]:
            return {"error": "No text detected"}

        # Extract text lines and their bounding boxes (we mostly care about text for now)
        # result structure: [[[[x1,y1],[x2,y2],[x3,y3],[x4,y4]], (text, confidence)], ...]
        text_lines = [line[1][0] for line in result[0]]
        
        # Step 2: Use Regex to find "Total", "Date", and line items
        extracted_data = self._extract_fields(text_lines)
        
        # Step 3: (Optional placeholder) If local confidence low, prep payload for GPT-4o-mini API.
        # This is where we would check if extracted_data['total'] is None or confidence is low.
        if extracted_data.get('total') is None:
            extracted_data['warning'] = "Low confidence in extracted data. Consider using GPT-4o-mini fallback."
            
        return extracted_data

    def _extract_fields(self, lines):
        data = {
            "merchant": None,
            "date": None,
            "total": None,
            "items": []
        }
        
        # Regex Patterns
        # Date: Matches MM/DD/YYYY, YYYY-MM-DD, etc.
        date_pattern = r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}[/-]\d{1,2}[/-]\d{1,2})'
        # Price: Matches numbers with 2 decimal places
        price_pattern = r'(\d+\.\d{2})'
        # Total keywords
        total_pattern = r'(?i)(total|amount due|balance|grand total)'
        
        for i, line in enumerate(lines):
            line = line.strip()
            
            # Merchant: Heuristic - usually the first non-numeric line at the top
            if not data["merchant"] and len(line) > 3 and not re.search(r'\d', line):
                data["merchant"] = line
            
            # Date
            if not data["date"]:
                date_match = re.search(date_pattern, line)
                if date_match:
                    data["date"] = date_match.group(1)
            
            # Total
            if re.search(total_pattern, line):
                # Look for price in this line
                price_match = re.search(price_pattern, line)
                if price_match:
                    data["total"] = float(price_match.group(1))
                elif i + 1 < len(lines):
                    # Check next line for the price
                    next_line = lines[i+1]
                    price_match = re.search(price_pattern, next_line)
                    if price_match:
                        data["total"] = float(price_match.group(1))

            # Line Items: Heuristic - Text followed by a price at the end of the line
            # Exclude lines that look like totals or dates
            if not re.search(total_pattern, line) and not re.search(r'^Date:', line, re.IGNORECASE):
                item_match = re.search(r'(.+?)\s+(\d+\.\d{2})$', line)
                if item_match:
                    item_name = item_match.group(1).strip()
                    item_price = float(item_match.group(2))
                    # Filter out likely noise (e.g. just a price, or very short text)
                    if len(item_name) > 2:
                        data["items"].append({"name": item_name, "price": item_price})

        return data

# Export a singleton instance
receipt_scanner = ReceiptScanner()
