import sys
import os
sys.path.append(os.getcwd())
import unittest
from unittest.mock import MagicMock, patch
from backend.parsers.pdf_parser import GenericParser

class TestGenericParserSimple(unittest.TestCase):
    def test_parse_simple(self):
        print("Starting Simple Test")
        parser = GenericParser()
        
        # Mock Setup
        mock_pdf = MagicMock()
        mock_page1 = MagicMock()
        mock_page1.extract_text.return_value = "Statement 2025"
        mock_page1.width = 600
        
        mock_table1 = MagicMock()
        mock_table1.bbox = (50, 200, 550, 400)
        mock_table1.extract.return_value = [["Date", "Amount", "Desc"], ["08/22", "20.00", "Test Income"]]
        
        mock_page1.find_tables.return_value = [mock_table1]
        
        def crop_side_effect(bbox):
            m = MagicMock()
            m.extract_text.return_value = "Deposits"
            return m
        
        mock_page1.crop.side_effect = crop_side_effect
        mock_pdf.pages = [mock_page1]
        
        with patch('backend.parsers.pdf_parser.pdfplumber.open') as mock_open:
            mock_open.return_value.__enter__.return_value = mock_pdf
            
            df = parser.parse("dummy.pdf")
            
            self.assertFalse(df.empty)
            self.assertEqual(len(df), 1)
            self.assertEqual(df.iloc[0]['amount'], 20.00)
            self.assertEqual(df.iloc[0]['description'], "Test Income")
            print("Simple Test Passed")

if __name__ == "__main__":
    unittest.main(buffer=False)
