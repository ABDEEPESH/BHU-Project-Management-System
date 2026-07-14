@echo off
echo ========================================
echo   Complete API Endpoint Fix
echo ========================================
echo.

echo Step 1: Starting MongoDB (if not running)...
echo Please ensure MongoDB is running on port 27017
echo.

echo Step 2: Starting Backend Server...
start "Backend Server" cmd /k "cd /d c:\ProjectSubmissionClient\ProjecrSubmission\ProjecrSubmission && mvn spring-boot:run"

echo Waiting 45 seconds for backend to fully start...
timeout /t 45 /nobreak

echo.
echo Step 3: Initializing Sample Data...
echo Creating sample employees...
curl -X POST http://localhost:8080/api/init/sample-employees
echo.

echo Creating sample bank details...
curl -X POST http://localhost:8080/api/bank-details/create -H "Content-Type: application/json" -d "{\"bankName\":\"State Bank of India\",\"accountNumber\":\"123456789\",\"accountName\":\"University Account\",\"ifscCode\":\"SBIN0001234\",\"branchName\":\"Main Branch\",\"accountType\":\"Current\",\"isActive\":true}"
echo.

echo.
echo Step 4: Testing All Endpoints...
call test-endpoints.bat

echo.
echo Step 5: Starting Frontend...
start "Frontend Server" cmd /k "cd /d c:\ProjectSubmissionClient\employee-project-frontend-cra && npm start"

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Backend: http://localhost:8080
echo Frontend: http://localhost:3000
echo Swagger UI: http://localhost:8080/swagger-ui.html
echo.
echo Sample Data Available:
echo - Employees: 18166, 10152, 12345
echo - Bank Details: SBI Account
echo.
echo All endpoints should now be working!
echo.
pause