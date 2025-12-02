"""Test basic API connectivity"""
import requests

# Test root endpoint
try:
    response = requests.get("http://127.0.0.1:8000/")
    print(f"Root endpoint: {response.status_code}")
except Exception as e:
    print(f"Root endpoint error: {e}")

# Test docs endpoint
try:
    response = requests.get("http://127.0.0.1:8000/docs")
    print(f"Docs endpoint: {response.status_code}")
except Exception as e:
    print(f"Docs endpoint error: {e}")
