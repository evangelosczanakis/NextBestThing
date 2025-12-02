import requests
import os
from pathlib import Path

# Configuration
BASE_URL = "http://localhost:8000"
UPLOAD_ENDPOINT = f"{BASE_URL}/upload-pdf"
TEST_PDF_PATH = "test_upload.pdf"

def create_dummy_pdf():
    """Use existing PDF for testing."""
    existing_pdf = Path("df8fadc5-9eef-4b09-9f3c-71c8f394572e.pdf")
    if existing_pdf.exists():
        print(f"Using existing PDF: {existing_pdf}")
        return existing_pdf
    
    print("ERROR: No PDF found and reportlab is not installed.")
    raise FileNotFoundError("Please provide a test PDF.")

def test_upload():
    pdf_path = create_dummy_pdf()
    
    print(f"Testing upload with {pdf_path}...")
    
    with open(pdf_path, 'rb') as f:
        files = {'file': (pdf_path.name, f, 'application/pdf')}
        try:
            print("Sending request...")
            response = requests.post(UPLOAD_ENDPOINT, files=files)
            
            print(f"DEBUG: Status Code: {response.status_code}")
            # Save response to file for inspection
            with open("response_error.txt", "w", encoding="utf-8") as f_err:
                f_err.write(f"Status: {response.status_code}\n")
                f_err.write(f"Body: {response.text}\n")
            print(f"DEBUG: Response Text: {response.text}")
            
            if response.status_code == 200:
                print("SUCCESS: Upload and parse successful.")
                data = response.json()
                transactions = data.get("transactions", [])
                print(f"Transactions found: {len(transactions)}")
                for t in transactions:
                    print(f" - {t['date']} {t['amount']} {t['type']} {t['description']}")
            else:
                print(f"FAILURE: Upload failed with status {response.status_code}")
                
        except Exception as e:
            print(f"ERROR: Request failed: {e}")

    # Check if temp file was cleaned up
    temp_dir = Path("temp_uploads")
    if temp_dir.exists():
        files = list(temp_dir.glob("*.pdf"))
        if not files:
            print("SUCCESS: temp_uploads directory is empty.")
        else:
            print(f"FAILURE: temp_uploads directory contains files: {files}")
    else:
        print("SUCCESS: temp_uploads directory does not exist (or was cleaned up).")

if __name__ == "__main__":
    test_upload()
