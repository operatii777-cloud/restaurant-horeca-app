@echo off
REM Script Windows pentru pornirea automată a arhivării Cursor
REM Rulează arhivarea în background și o monitorizează

cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0auto-start.ps1"

