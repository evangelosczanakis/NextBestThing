"""
Debug script to inspect raw PDF extraction.

Usage:
    python debug_pdf.py path/to/statement.pdf

Purpose:
    - See what pdfplumber actually extracts from the PDF
    - Diagnose header merging issues (e.g., 'DateAmountDescription')
    - Understand table structure before implementing parsing logic
"""

import pdfplumber
import sys


def debug_pdf(file_path):
    """
    Load PDF and print diagnostic information.
    """
    print("=" * 80)
    print(f"DEBUG PDF: {file_path}")
    print("=" * 80)
    
    try:
        with pdfplumber.open(file_path) as pdf:
            print(f"\nTotal Pages: {len(pdf.pages)}\n")
            
            # ===== PAGE 1 RAW TEXT =====
            if len(pdf.pages) >= 1:
                print("\n" + "=" * 80)
                print("PAGE 1 - RAW TEXT")
                print("=" * 80)
                page1_text = pdf.pages[0].extract_text()
                print(page1_text or "[NO TEXT FOUND]")
            
            # ===== PAGE 2 RAW TEXT =====
            if len(pdf.pages) >= 2:
                print("\n" + "=" * 80)
                print("PAGE 2 - RAW TEXT")
                print("=" * 80)
                page2_text = pdf.pages[1].extract_text()
                print(page2_text or "[NO TEXT FOUND]")
                
                # ===== PAGE 2 TABLE EXTRACTION =====
                print("\n" + "=" * 80)
                print("PAGE 2 - TABLE EXTRACTION (extract_tables)")
                print("=" * 80)
                
                tables = pdf.pages[1].extract_tables()
                
                if tables:
                    print(f"\nFound {len(tables)} table(s)\n")
                    
                    for idx, table in enumerate(tables):
                        print(f"\n--- TABLE {idx + 1} ---")
                        print(f"Rows: {len(table)}")
                        
                        # Print first 5 rows
                        for row_idx, row in enumerate(table[:5]):
                            print(f"Row {row_idx}: {row}")
                        
                        if len(table) > 5:
                            print(f"... ({len(table) - 5} more rows)")
                else:
                    print("[NO TABLES FOUND]")
            
            # ===== ALL PAGES - TABLE COUNT =====
            print("\n" + "=" * 80)
            print("ALL PAGES - TABLE SUMMARY")
            print("=" * 80)
            
            for page_num, page in enumerate(pdf.pages):
                tables = page.extract_tables()
                table_count = len(tables) if tables else 0
                print(f"Page {page_num + 1}: {table_count} table(s)")
    
    except Exception as e:
        print(f"\nERROR: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n" + "=" * 80)
    print("DEBUG COMPLETE")
    print("=" * 80)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python debug_pdf.py <path_to_pdf>")
        print("Example: python debug_pdf.py uploads/statement.pdf")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    debug_pdf(pdf_path)
