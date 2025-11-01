# Backend Setup Guide

## Prerequisites
1. Java 11 or higher
2. MongoDB running on localhost:27017
3. Maven (for building the project)

## Starting the Backend

### Option 1: Using Maven (Recommended)
```bash
cd ProjecrSubmission/ProjecrSubmission
mvn spring-boot:run
```

### Option 2: Using compiled JAR
```bash
cd ProjecrSubmission/ProjecrSubmission
mvn clean package
java -jar target/ProjecrSubmission-0.0.1-SNAPSHOT.jar
```

## Verifying Backend is Running

1. Open your browser and go to: http://localhost:8080/api/health
2. You should see a JSON response like:
```json
{
  "status": "UP",
  "database": "your-db-name",
  "message": "Application is running and connected to MongoDB",
  "timestamp": "2025-01-08T..."
}
```

## API Endpoints
- Health Check: `GET /api/health`
- Employees: `GET /api/employee`
- Projects: `GET /api/project`
- Funding Agencies: `GET /api/funding-agencies`
- Project Submissions: `GET /api/project-submission/all`
- Project Received: `GET /api/project-received`
- Fund Receipts: `GET /api/fund-receipt/all`

## CORS Configuration
The backend is already configured to allow requests from:
- http://localhost:3000 (React development server)
- http://localhost:8080 (Backend server)

## Troubleshooting

### If you get CORS errors:
1. Make sure the backend is running on port 8080
2. Check that MongoDB is running on port 27017
3. Restart both frontend and backend

### If MongoDB connection fails:
1. Start MongoDB service: `mongod`
2. Or use MongoDB Atlas cloud database
3. Update connection string in `application.properties`

### Common startup issues:
1. Port 8080 already in use: Stop other services or change port
2. MongoDB not found: Install and start MongoDB
3. Java version: Ensure Java 11+ is installed
