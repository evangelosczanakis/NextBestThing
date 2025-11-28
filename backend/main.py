from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import json
from typing import Optional
from backend.parser import extract_transactions

app = FastAPI()

# CORS Configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from backend.detective import detect_recurring

# In-memory storage for the latest session's transactions (Prototype only)
SESSION_DATA = []

@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    """
    Endpoint to upload a PDF file and extract transactions.
    Stores transactions in SESSION_DATA for analysis.
    Returns structured data: { "meta": ..., "transactions": ... }
    """
    global SESSION_DATA
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")

    temp_file = f"temp_{file.filename}"
    try:
        with open(temp_file, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        result = extract_transactions(temp_file)
        # SESSION_DATA expects a list of transactions for the detective
        # We extract the list from the result
        SESSION_DATA = result.get("transactions", []) 
        
        # For the detective to work, it needs 'merchant' key, but our parser now produces 'desc'
        # Let's map 'desc' to 'merchant' for backward compatibility with detective.py
        for t in SESSION_DATA:
            if 'merchant' not in t:
                t['merchant'] = t['desc']

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_file):
            os.remove(temp_file)

@app.get("/analyze-subscriptions")
def analyze_subscriptions():
    """
    Analyze the current session's transactions for recurring subscriptions.
    """
    global SESSION_DATA
    if not SESSION_DATA:
        return {"message": "No data found. Please upload a PDF first.", "subscriptions": []}
    
    subscriptions = detect_recurring(SESSION_DATA)
    return {"subscriptions": subscriptions}

@app.get("/search-item")
def search_item(query: str):
    """
    Search for a swap item by query string.
    Returns the best match object with price_diff.
    """
    try:
        # Assuming running from root directory
        data_path = os.path.join("backend", "data", "swaps.json")
        if not os.path.exists(data_path):
             # Fallback if running from backend dir
             data_path = os.path.join("data", "swaps.json")
             
        with open(data_path, "r") as f:
            swaps = json.load(f)
        
        query_lower = query.lower()
        
        # Simple linear search for best match (substring match)
        for swap in swaps:
            if query_lower in swap["name_brand"].lower():
                return swap
        
        return {"message": "No match found", "query": query}
        
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Swaps database not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
