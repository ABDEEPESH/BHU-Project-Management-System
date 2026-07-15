@echo off
echo ========================================
echo   API Issues Fix Script
echo ========================================
echo.
echo Step 1: Starting backend server...
echo Please make sure MongoDB is running first!
echo.
echo Starting backend in new window...
start "Backend Server" cmd /k "cd /d c:\ProjectSubmissionClient\ProjecrSubmission\ProjecrSubmission && mvn spring-boot:run"

echo.
echo Waiting 30 seconds for backend to start...
timeout /t 30 /nobreak

echo.
echo Step 2: Initializing sample employee data...
curl -X POST http://localhost:8080/api/init/sample-employees
echo.

echo.
echo Step 3: Testing employee API...
curl -X GET http://localhost:8080/api/employee
echo.

echo.
echo Step 4: Starting frontend...
start "Frontend Server" cmd /k "cd /d c:\ProjectSubmissionClient\employee-project-frontend-cra && npm start"

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Backend: http://localhost:8080
echo Frontend: http://localhost:3000
echo.
echo Sample Employee IDs created:
echo - 18166 (Dr. John Smith)
echo - 10152 (Dr. Sarah Johnson) 
echo - 12345 (Dr. Test User)
echo.
echo You can now use these EIDs in your forms!
echo.
pause