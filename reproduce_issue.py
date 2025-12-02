import requests

url = "http://localhost:8000/upload-pdf"
files = {'file': ('test.pdf', open('test_statement.pdf', 'rb'), 'application/pdf')}

try:
    response = requests.post(url, files=files)
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.text}")
except Exception as e:
    print(f"Request Failed: {e}")
