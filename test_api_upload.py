"""
Test the /upload-pdf API endpoint directly.
"""

import requests

def test_upload():
    """Upload PDF to the running backend."""
    
    pdf_path = "df8fadc5-9eef-4b09-9f3c-71c8f394572e.pdf"
    url = "http://127.0.0.1:8000/upload-pdf"
    
    print(f"Testing API: {url}")
    print(f"File: {pdf_path}")
    print("=" * 80)
    
    try:
        with open(pdf_path, 'rb') as f:
            files = {'file': (pdf_path, f, 'application/pdf')}
            response = requests.post(url, files=files)
        
        print(f"\nStatus Code: {response.status_code}")
        print(f"Response Headers: {response.headers}")
        print(f"\nResponse Body:")
        print(response.text)
        
        if response.status_code == 200:
            data = response.json()
            print(f"\n✓ SUCCESS!")
            print(f"Transactions found: {len(data.get('transactions', []))}")
        else:
            print(f"\n✗ FAILED!")
            
    except Exception as e:
        print(f"\n✗ ERROR: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_upload()
