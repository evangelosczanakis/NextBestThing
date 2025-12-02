import sys
import os
sys.path.append(os.getcwd())
import unittest
from unittest.mock import MagicMock, patch
from datetime import datetime
from backend.parsers.pdf_parser import GenericParser

class TestGenericParser(unittest.TestCase):
    def setUp(self):
        self.parser = GenericParser()

    @patch('backend.parsers.pdf_parser.pdfplumber.open')
    def test_parse_pnc_structure(self, mock_open):
        print("DEBUG: Test Start")
        # Setup Mock PDF Structure
        mock_pdf = MagicMock()
        mock_open.return_value.__enter__.return_value = mock_pdf
        
        # Mock Page 1 (Year extraction)
        mock_page1 = MagicMock()
        mock_page1.extract_text.return_value = "Virtual Wallet Spend Statement\nFor the period 08/22/2025 to 09/22/2025"
        mock_page1.width = 600
        
        # Mock Tables
        # Table 1: Deposits (Income)
        mock_table1 = MagicMock()
        mock_table1.bbox = (50, 200, 550, 400) # top is 200
        mock_table1.extract.return_value = [
            ["Date", "Amount", "Description"], # Header
            ["08/22", "20.00", "ACH Web Pmt- Bank Xfer"],
            ["08/25", "1,780.21", "Mobile Deposit"]
        ]
        
        # Table 2: Withdrawals (Expense)
        mock_table2 = MagicMock()
        mock_table2.bbox = (50, 500, 550, 700) # top is 500
        mock_table2.extract.return_value = [
            ["Date", "Amount", "Description"],
            ["08/27", "34.92", "POS Purchase Wal-Mart"],
            ["08/28", "7.42", "Taco Bell"]
        ]

        # Setup find_tables to return these tables
        mock_page1.find_tables.return_value = [mock_table1, mock_table2]
        
        # Setup crop().extract_text() to return headers based on bbox
        def crop_side_effect(bbox):
            print(f"DEBUG: Mock crop called with {bbox}")
            mock_crop = MagicMock()
            if bbox[3] == 200: # Table 1
                mock_crop.extract_text.return_value = "Deposits and Other Additions"
            elif bbox[3] == 500: # Table 2
                mock_crop.extract_text.return_value = "Banking/Debit Card Withdrawals and Purchases"
            else:
                mock_crop.extract_text.return_value = ""
            return mock_crop

        mock_page1.crop.side_effect = crop_side_effect
        
        mock_pdf.pages = [mock_page1]

        # Execute Parse
        try:
            df = self.parser.parse("dummy.pdf")
            print(f"DEBUG: DF Result: {df}")
            if df.empty:
                print("DEBUG: DF is empty!")
        except Exception as e:
            print(f"DEBUG: Exception during parse: {e}")
            import traceback
            traceback.print_exc()
            raise e
        
        # Verify Results
        self.assertFalse(df.empty, "DataFrame should not be empty")
        self.assertEqual(len(df), 4) # 2 deposits, 2 withdrawals
        
        # Check Sort Order (Date)
        self.assertEqual(df.iloc[0]['description'], "ACH Web Pmt- Bank Xfer")
        self.assertEqual(df.iloc[0]['amount'], 20.00) # Income positive
        
        self.assertEqual(df.iloc[2]['description'], "POS Purchase Wal-Mart")
        self.assertEqual(df.iloc[2]['amount'], -34.92) # Expense negative (multiplier -1)

        print("\nTest Successful! Parsed Transactions:")
        print(df[['date', 'description', 'amount']])

if __name__ == '__main__':
    unittest.main(buffer=False)
