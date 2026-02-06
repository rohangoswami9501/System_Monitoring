@echo off
echo ========================================
echo System Monitor - Backend Setup
echo ========================================
echo.

cd ..\backend

echo [1/4] Creating virtual environment...
python -m venv venv
if errorlevel 1 (
    echo ERROR: Failed to create virtual environment
    pause
    exit /b 1
)

echo [2/4] Activating virtual environment...
call venv\Scripts\activate.bat

echo [3/4] Installing dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo [4/4] Creating .env file...
if not exist .env (
    copy .env.example .env
    echo .env file created. Please update with your PostgreSQL credentials.
) else (
    echo .env file already exists.
)

echo.
echo ========================================
echo Backend setup complete!
echo ========================================
echo.
echo Next steps:
echo 1. Make sure PostgreSQL is running
echo 2. Create database: CREATE DATABASE system_monitor;
echo 3. Update .env with your database credentials
echo 4. Run: python main.py
echo.
pause
