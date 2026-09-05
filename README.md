# MediIntake AI — AI-Powered Clinical History Intake Platform

A local demo implementation matching the requested 5-step patient flow:

1. Welcome: language, new/existing patient, consent
2. Conversational SOCRATES history with quick replies + browser voice input
3. Prescription/report upload with OCR adapter
4. Editable extracted fields
5. Doctor View with structured clinical draft, edit/confirm, print

## Requirements
- Node.js 18+
- Python 3.10+
- Optional local MongoDB
- Optional Tesseract OCR installation for real image OCR

## Start backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Windows PowerShell activation:
```powershell
.venv\Scripts\Activate.ps1
```

## Start frontend
In another terminal:
```bash
cd frontend
npm install
npm run dev
```
Open the Vite URL, normally http://localhost:5173.

## Demo mode
The app works without an LLM API key and without MongoDB. The backend automatically uses:
- `LLM_PROVIDER=mock` deterministic responses, while keeping the swappable `call_llm(prompt)` function in `backend/app/llm_client.py`.
- in-memory session storage if MongoDB is unavailable.
- OCR fallback sample text if Tesseract/PDF extraction cannot process a demo file.

To connect a real provider, replace `call_llm` in `backend/app/llm_client.py` and keep the API contract unchanged.

To connect a real OCR stack, replace `run_ocr` in `backend/app/ocr_client.py`.

## Sample/demo patient
A `demo-session` is seeded on backend startup with patient ID `P-DEMO-001`. For a clean demo, simply choose **New Patient**. Existing Patient can use `demo-session`.

## Architecture
```text
React + Tailwind
   |
   | /api/chat
   | /api/extract-document
   | /api/generate-summary
   v
FastAPI
   |-- llm_client.py  <-- swappable LLM
   |-- ocr_client.py  <-- swappable OCR
   |-- database.py     <-- MongoDB + demo fallback
   v
MongoDB (optional)
```

## Intentionally out of scope
ABHA/ABDM/FHIR integration, authentication, multilingual ASR, and emergency red-flag detection are not implemented; the UI leaves these as future placeholders/notes.
