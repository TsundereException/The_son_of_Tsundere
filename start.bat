@echo off
title Start Website

set ROOT=%~dp0
set BACKEND=%ROOT%Backend
set FRONTEND=%ROOT%Frontend

echo Starting Django Backend...
start "Django Backend" cmd /k "cd /d "%BACKEND%" && call venv\Scripts\activate.bat && python manage.py runserver"

timeout /t 3 /nobreak >nul

echo Starting Vite Frontend...
start "Vite Frontend" cmd /k "cd /d "%FRONTEND%" && npm run dev"

echo.
echo Both servers started!
echo Backend  -^>  http://127.0.0.1:8000
echo Frontend -^>  http://localhost:5173
echo Admin    -^>  http://127.0.0.1:8000/admin
echo.
pause
