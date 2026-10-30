@echo off
setlocal
echo ===================================================
echo StructTutor - Windows 10 Local Setup
echo ===================================================

where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Python was not found on your PATH. Please install Python 3.11+ first.
    exit /b 1
)

if not exist ".venv" (
    echo Creating local virtual environment in .venv ...
    python -m venv .venv
)

echo Activating virtual environment and installing dependencies...
call .venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -e ".[dev]"

echo.
echo Setup complete. Run tests with: pytest
echo Launch application with: run_windows.bat
endlocal