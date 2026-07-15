@echo off
echo Initializing sample employee data...
curl -X POST http://localhost:8080/api/init/sample-employees
echo.
echo Sample data initialization complete.
pause