# MediIntake AI backend

## Run
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Tesseract is optional for the included demo fallback, but recommended for real OCR. Install it with your OS package manager.

MongoDB is optional for local demo: if MongoDB is not reachable, sessions are stored in memory.
