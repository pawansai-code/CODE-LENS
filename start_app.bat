@echo off
echo Starting CodeLens Application...
start "CodeLens Backend" cmd /k "run_backend.bat"
start "CodeLens Frontend" cmd /k "run_frontend.bat"
echo Both servers have been started!
