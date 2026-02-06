@echo off
echo ========================================
echo System Monitor - Starting Backend
echo ========================================
echo.

cd ..\backend

if not exist venv (
    echo ERROR: Virtual environment not found!
    echo Please run setup-backend.bat first.
    pause
    exit /b 1
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Starting FastAPI server...
echo.
echo Backend running at: http://localhost:8000
echo API docs at: http://localhost:8000/docs
echo.

python main.py
