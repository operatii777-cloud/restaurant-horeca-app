@echo off
REM ========================================
REM 🚀 Restaurant App - Quick Deploy Script
REM ========================================
REM Rulează din Windows CMD pentru deploy automat pe Contabo

echo.
echo ========================================
echo 🚀 Restaurant App - Quick Deploy
echo ========================================
echo.

REM Verificare Git
if not exist ".git" (
    echo ❌ Nu este repository Git!
    echo    Rulează: git init
    exit /b 1
)

REM Git Status
echo 📋 Step 1: Git Status
echo.
git status -s
echo.

REM Git Add
echo 📋 Step 2: Git Add ^& Commit
echo.
git add .
git commit -m "Update aplicație - %date% %time%"
echo.

REM Git Push
echo 📋 Step 3: Git Push
echo.
git push origin main
if %errorlevel% neq 0 (
    echo ❌ Push failed
    pause
    exit /b 1
)
echo.

REM Deploy pe server
echo 📋 Step 4: Deploy to Server
echo.
echo ⚠️  Pentru deploy automat pe server, folosește deploy.ps1 în PowerShell
echo    SAU conectează-te manual cu SSH și rulează:
echo    ssh root@your-contabo-ip "/usr/local/bin/restaurant-update.sh"
echo.

echo ✅ Git push finalizat!
echo    Conectează-te pe server pentru finalizare deploy.
echo.
pause

