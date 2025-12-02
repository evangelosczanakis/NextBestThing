"""
Simple test of just the BruteForceParser directly.
"""

from backend.parsers.brute_force_parser import BruteForceParser

pdf_path = "df8fadc5-9eef-4b09-9f3c-71c8f394572e.pdf"

print(f"Testing BruteForceParser directly")
print(f"File: {pdf_path}")
print("=" * 80)

try:
    parser = BruteForceParser()
    df = parser.parse(pdf_path)
    
    print(f"\n✓ SUCCESS: Found {len(df)} transactions")
    print(f"\nDataFrame info:")
    print(df.info())
    print(f"\nFirst 3 rows:")
    print(df.head(3))
    print(f"\nData types:")
    print(df.dtypes)
    
    # Test JSON conversion
    print(f"\nTesting JSON conversion:")
    records = df.to_dict(orient='records')
    print(f"Successfully converted to {len(records)} records")
    print(f"First record: {records[0]}")
    
except Exception as e:
    print(f"\n✗ ERROR: {type(e).__name__}: {str(e)}")
    import traceback
    traceback.print_exc()
