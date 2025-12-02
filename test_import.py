"""Test if the backend imports correctly"""
try:
    from backend.main import app
    print("✓ Backend imports successfully")
except Exception as e:
    print(f"✗ Import failed: {e}")
    import traceback
    traceback.print_exc()
