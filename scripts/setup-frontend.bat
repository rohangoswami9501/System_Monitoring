@echo off
echo ========================================
echo System Monitor - Frontend Setup
echo ========================================
echo.

cd ..\frontend

echo [1/2] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo [2/2] Setup complete!

echo.
echo ========================================
echo Frontend setup complete!
echo ========================================
echo.
echo To start the development server, run:
echo   npm run dev
echo.
pause
