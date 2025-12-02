import sys
import os
sys.path.append(os.getcwd())
from unittest.mock import MagicMock, patch
from backend.parsers.pdf_parser import GenericParser
import pandas as pd

def verify_parser():
    print("Running Verification Script...")
    parser = GenericParser()
    
    # Mock Setup
    mock_pdf = MagicMock()
    mock_page1 = MagicMock()
    mock_page1.extract_text.return_value = "Statement 2025"
    mock_page1.width = 600
    
    # Mock Table 1: Income
    mock_table1 = MagicMock()
    mock_table1.bbox = (50, 200, 550, 400)
    mock_table1.extract.return_value = [["Date", "Amount", "Desc"], ["08/22", "20.00", "Test Income"]]
    
    # Mock Table 2: Expense
    mock_table2 = MagicMock()
    mock_table2.bbox = (50, 500, 550, 700)
    mock_table2.extract.return_value = [["Date", "Amount", "Desc"], ["08/23", "50.00", "Test Expense"]]

    mock_page1.find_tables.return_value = [mock_table1, mock_table2]
    
    def crop_side_effect(bbox):
        m = MagicMock()
        # Check bbox top to decide text
        if bbox[3] == 200:
            m.extract_text.return_value = "Deposits"
        elif bbox[3] == 500:
            m.extract_text.return_value = "Withdrawals"
        else:
            m.extract_text.return_value = ""
        return m
    
    mock_page1.crop.side_effect = crop_side_effect
    mock_pdf.pages = [mock_page1]
    
    with patch('backend.parsers.pdf_parser.pdfplumber.open') as mock_open:
        mock_open.return_value.__enter__.return_value = mock_pdf
        
        try:
            df = parser.parse("dummy.pdf")
            print("\n--- Parser Output ---")
            print(df)
            
            # Assertions
            if df.empty:
                print("FAILURE: DataFrame is empty")
                sys.exit(1)
                
            if len(df) != 2:
                print(f"FAILURE: Expected 2 rows, got {len(df)}")
                sys.exit(1)
                
            # Check Income
            row1 = df.iloc[0]
            if row1['amount'] != 20.00 or row1['description'] != "Test Income":
                print(f"FAILURE: Row 1 mismatch. Got {row1}")
                sys.exit(1)
                
            # Check Expense
            row2 = df.iloc[1]
            if row2['amount'] != -50.00 or row2['description'] != "Test Expense":
                print(f"FAILURE: Row 2 mismatch. Got {row2}")
                sys.exit(1)
                
            print("\nSUCCESS: All checks passed!")
            
        except Exception as e:
            print(f"FAILURE: Exception occurred: {e}")
            import traceback
            traceback.print_exc()
            sys.exit(1)

if __name__ == "__main__":
    verify_parser()
