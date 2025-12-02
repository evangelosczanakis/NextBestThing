"""
Test script to validate PDF parsers against a specific PDF file.
"""

import sys
from backend.parsers.pdf_parser import GenericParser
from backend.parsers.brute_force_parser import BruteForceParser
from backend.parsers.generic_parser import GenericPDFParser

def test_parsers(pdf_path):
    """Test all three parsers against the PDF."""
    
    print("=" * 80)
    print("TESTING PDF PARSERS")
    print(f"File: {pdf_path}")
    print("=" * 80)
    
    # Test 1: GenericParser (current production parser)
    print("\n" + "=" * 80)
    print("TEST 1: GenericParser (Table-based)")
    print("=" * 80)
    try:
        parser1 = GenericParser()
        df1 = parser1.parse(pdf_path)
        print(f"✓ SUCCESS: Found {len(df1)} transactions")
        if len(df1) > 0:
            print("\nFirst 5 transactions:")
            print(df1.head().to_string())
            print(f"\nTotal Amount: ${df1['amount'].sum():.2f}")
    except Exception as e:
        print(f"✗ FAILED: {type(e).__name__}: {str(e)}")
    
    # Test 2: GenericPDFParser (loose extraction)
    print("\n" + "=" * 80)
    print("TEST 2: GenericPDFParser (Loose extraction)")
    print("=" * 80)
    try:
        parser2 = GenericPDFParser()
        df2 = parser2.parse_statement_loose(pdf_path)
        print(f"✓ SUCCESS: Found {len(df2)} transactions")
        if len(df2) > 0:
            print("\nFirst 5 transactions:")
            print(df2.head().to_string())
            print(f"\nTotal Amount: ${df2['amount'].sum():.2f}")
    except Exception as e:
        print(f"✗ FAILED: {type(e).__name__}: {str(e)}")
    
    # Test 3: BruteForceParser (regex-based)
    print("\n" + "=" * 80)
    print("TEST 3: BruteForceParser (Regex-based)")
    print("=" * 80)
    try:
        parser3 = BruteForceParser()
        df3 = parser3.parse(pdf_path)
        print(f"✓ SUCCESS: Found {len(df3)} transactions")
        if len(df3) > 0:
            print("\nFirst 5 transactions:")
            print(df3.head().to_string())
            print(f"\nTotal Amount: ${df3['amount'].sum():.2f}")
    except Exception as e:
        print(f"✗ FAILED: {type(e).__name__}: {str(e)}")
    
    print("\n" + "=" * 80)
    print("TESTING COMPLETE")
    print("=" * 80)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_parsers.py <path_to_pdf>")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    test_parsers(pdf_path)
