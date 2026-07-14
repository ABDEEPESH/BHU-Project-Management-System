@echo off
echo Starting Project Submission System...
echo.

echo Starting Backend (Spring Boot)...
cd ProjecrSubmission\ProjecrSubmission
start "Backend" cmd /k "mvn spring-boot:run"
cd ..\..

echo.
echo Starting Frontend (React)...
cd employee-project-frontend-cra
start "Frontend" cmd /k "npm start"
cd ..

echo.
echo Services are starting up...
echo Backend will be available at: http://localhost:8080
echo Frontend will be available at: http://localhost:3000
echo.
echo Press any key to exit this launcher...
pause >nul
