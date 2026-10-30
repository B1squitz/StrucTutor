@echo off
setlocal
cd /d "%~dp0"

if not exist "dist\StructTutor.html" (
    echo Built file dist\StructTutor.html not found. Building StructTutor...
    if not exist "node_modules" (
        call npm install
    )
    call npm run build
)

if exist "dist\StructTutor.html" (
    start "" "%~dp0dist\StructTutor.html"
    exit /b 0
)

echo Error: dist\StructTutor.html could not be built or opened.
pause
exit /b 1
