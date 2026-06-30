@echo off
echo Starting CodeLens Backend...
call .\venv\Scripts\activate.bat
python -m uvicorn app.main:app --port 8001 --reload
