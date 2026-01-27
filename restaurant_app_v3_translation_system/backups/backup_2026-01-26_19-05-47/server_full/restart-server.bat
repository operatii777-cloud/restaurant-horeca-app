@echo off
echo Opreste procesele Node.js...
taskkill /F /IM node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo Procese Node.js oprite cu succes.
) else (
    echo Nu exista procese Node.js active.
)
timeout /t 2 /nobreak >nul
echo Porneste serverul...
cd /d "%~dp0"
start "Restaurant App Server" cmd /k "npm start"
echo Serverul a fost pornit in fereastra separata.
pause
