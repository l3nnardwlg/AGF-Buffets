@echo off
setlocal
cd /d "%~dp0"

echo ========================================
echo  MY HI TASTE Buffet-Order - Dev Server
echo ========================================
echo.

if not exist "node_modules" (
    echo [1/2] Installiere Abhaengigkeiten ^(einmalig^)...
    call npm install --no-audit --no-fund
    if errorlevel 1 (
        echo.
        echo FEHLER: npm install fehlgeschlagen.
        pause
        exit /b 1
    )
    echo.
)

echo [2/2] Starte Dev-Server auf http://localhost:5173 ...
echo Zum Beenden: STRG+C
echo.
call npm run dev

pause
