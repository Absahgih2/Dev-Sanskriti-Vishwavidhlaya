@echo off
cd /d "E:\Coding\Dev Sanskriti Vishwavidhlaya\dsvv-marksheet"
start "DSVV Server" /min node server.js
timeout /t 2 /nobreak >nul
start "DSVV Vite" /min cmd /c "npx vite --port 3000 --host"
echo.
echo ==========================================
echo   DSVV Document Management System
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:3000
echo ==========================================
echo.
echo Press any key to stop servers...
pause >nul
taskkill /F /FI "WINDOWTITLE eq DSVV Server*" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq DSVV Vite*" >nul 2>&1
echo Servers stopped.
