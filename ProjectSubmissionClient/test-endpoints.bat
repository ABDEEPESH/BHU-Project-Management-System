@echo off
echo ========================================
echo   Testing Backend API Endpoints
echo ========================================
echo.

echo Testing Employee endpoints...
echo.
echo 1. GET /api/employee
curl -s -X GET http://localhost:8080/api/employee
echo.
echo.

echo 2. GET /api/employee/eid/18166
curl -s -X GET http://localhost:8080/api/employee/eid/18166
echo.
echo.

echo Testing Project endpoints...
echo.
echo 3. GET /api/project
curl -s -X GET http://localhost:8080/api/project
echo.
echo.

echo Testing Project Submission endpoints...
echo.
echo 4. GET /api/project-submission/all
curl -s -X GET http://localhost:8080/api/project-submission/all
echo.
echo.

echo Testing Project Received endpoints...
echo.
echo 5. GET /api/project-received
curl -s -X GET http://localhost:8080/api/project-received
echo.
echo.

echo Testing Bank Details endpoints...
echo.
echo 6. GET /api/bank-details
curl -s -X GET http://localhost:8080/api/bank-details
echo.
echo.

echo 7. GET /api/bank-details/active
curl -s -X GET http://localhost:8080/api/bank-details/active
echo.
echo.

echo ========================================
echo   Endpoint Testing Complete
echo ========================================
pause