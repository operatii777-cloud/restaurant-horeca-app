@echo off
echo 🚀 Starting screenshot capture process...

cd /d %~dp0

echo 📸 Starting Puppeteer screenshots...
cd server\admin-vite
node tests\puppeteer-screenshots.js

echo ✅ Puppeteer screenshots completed!

echo 📋 Generating documentation...
cd ..\..
node generate-manual-documentation.js

echo 🎯 All screenshot capture and documentation generation completed!
pause