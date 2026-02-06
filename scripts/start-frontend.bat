@echo off
echo ========================================
echo System Monitor - Starting Frontend
echo ========================================
echo.

cd ..\frontend

if not exist node_modules (
    echo ERROR: Dependencies not installed!
    echo Please run setup-frontend.bat first.
    pause
    exit /b 1
)

echo Starting React development server...
echo.
echo Frontend will open at: http://localhost:3000
echo.

call npm run dev
