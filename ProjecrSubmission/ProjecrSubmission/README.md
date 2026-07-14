# Project Management System

A comprehensive Spring Boot application for managing project submissions with a modern React-based frontend.

## Features

### Backend (Spring Boot)
- **Project Submission Management**: Full CRUD operations for project submissions
- **Advanced Search & Filtering**: Search by project name, employee ID, department, faculty, project type, funding agency, cost range, and date range
- **Pagination Support**: Efficient data retrieval with pageable results
- **Statistics & Analytics**: Get comprehensive project submission statistics
- **Data Validation**: Comprehensive input validation with detailed error messages
- **MongoDB Integration**: NoSQL database for flexible data storage
- **RESTful API**: Clean, well-documented REST endpoints
- **Swagger Documentation**: Interactive API documentation

### Frontend (React + Tailwind CSS)
- **Modern UI/UX**: Beautiful, responsive interface built with Tailwind CSS
- **Project Search**: Advanced search with multiple filters
- **Project Creation**: Comprehensive form for creating new project submissions
- **Project Details**: Detailed view modal for each project submission
- **Employee Management**: Search and create employee records
- **Real-time Updates**: Dynamic data loading and updates

## System Requirements

- Java 17 or higher
- Maven 3.6+
- MongoDB (local or cloud instance)
- Modern web browser

## Setup Instructions

### 1. Environment Variables
Create a `.env` file in the project root with the following variables:
```bash
MONGO_DATABASE=your_database_name
MONGO_USER=your_mongodb_username
MONGO_PASSWORD=your_mongodb_password
MONGO_CLUSTER=your_mongodb_cluster_url
```

### 2. Database Setup
Ensure your MongoDB instance is running and accessible. The application will automatically create the necessary collections.

### 3. Running the Application
```bash
# Navigate to project directory
cd ProjecrSubmission

# Run with Maven
./mvnw spring-boot:run

# Or build and run JAR
./mvnw clean package
java -jar target/ProjecrSubmission-0.0.1-SNAPSHOT.jar
```

### 4. Access the Application
- **Main Application**: http://localhost:8080
- **Test Data Tool**: http://localhost:8080/test-data.html
- **API Documentation**: http://localhost:8080/swagger-ui.html

## API Endpoints

### Project Submission Endpoints

#### Create Project Submission
```
POST /api/project-submission/create
Content-Type: application/json

{
  "idNo": "EMP001",
  "principalInvestigatorName": "Dr. John Smith",
  "designation": "Associate Professor",
  "department": "Computer Science",
  "faculty": "Engineering",
  "projectName": "AI-Powered Healthcare Analytics",
  "fundingAgencyId": "FA001",
  "durationOfProject": "3 years",
  "typeOfProject": "Research",
  "totalProjectCost": 1500000.00,
  "recurring": 800000.00,
  "nonRecurring": 600000.00,
  "overhead": 100000.00,
  "dateOfSubmission": "2024-01-15",
  "remark": "Innovative research project"
}
```

#### Get Project Submission by ID
```
GET /api/project-submission/{id}
```

#### Search Project Submissions
```
GET /api/project-submission/search?projectName=AI&department=Computer Science&typeOfProject=Research&page=0&size=10
```

#### Get All Project Submissions (Paginated)
```
GET /api/project-submission?page=0&size=10
```

#### Get All Project Submissions (No Pagination)
```
GET /api/project-submission/all
```

#### Get Project Submissions by Department
```
GET /api/project-submission/department/{department}
```

#### Get Project Submissions by Employee ID
```
GET /api/project-submission/employee/{employeeId}
```

#### Get Project Submissions by Funding Agency
```
GET /api/project-submission/funding-agency/{fundingAgencyId}
```

#### Get Project Submission Statistics
```
GET /api/project-submission/stats/summary
```

#### Update Project Submission
```
PUT /api/project-submission/{id}
Content-Type: application/json
```

#### Delete Project Submission
```
DELETE /api/project-submission/{id}
```

### Employee Endpoints
```
GET /api/employee/eid/{eid}
POST /api/employee
```

## Frontend Usage

### 1. Search Projects
- Navigate to the "Search Projects" tab
- Use the search form to filter by various criteria
- Click "Search" to find matching project submissions
- Click "View" on any result to see detailed information

### 2. Create New Project
- Navigate to the "Create Project" tab
- Fill out the comprehensive form
- Required fields are marked with asterisks (*)
- Click "Create Project Submission" to save

### 3. View Project Details
- Click the "View" button on any project submission
- A detailed modal will show all project information
- Financial details are displayed in an easy-to-read format

### 4. Employee Management
- Use the "Search Employee" tab to find employees by EID
- Use the "Add Employee" tab to create new employee records

## Data Model

### Project Submission Fields
- **idNo**: Employee ID (Primary Key)
- **principalInvestigatorName**: Name of the principal investigator
- **designation**: Job designation
- **department**: Department name
- **faculty**: Faculty name
- **projectName**: Project title
- **fundingAgencyId**: Funding agency identifier
- **durationOfProject**: Project duration
- **typeOfProject**: Project type (Research, Development, Consultancy, Training)
- **totalProjectCost**: Total project cost
- **recurring**: Recurring costs
- **nonRecurring**: Non-recurring costs
- **overhead**: Overhead costs
- **dateOfSubmission**: Submission date (YYYY-MM-DD format)
- **remark**: Additional remarks
- **timestamp**: Automatic timestamp when record is created

## Validation Rules

- **Employee ID**: Required, 1-50 characters
- **Principal Investigator Name**: Required, 1-100 characters
- **Project Name**: Required, 1-100 characters
- **Funding Agency ID**: Required, 1-50 characters
- **Costs**: Must be non-negative numbers
- **Cost Validation**: recurring + nonRecurring + overhead = totalProjectCost
- **Date Format**: YYYY-MM-DD
- **Project Type**: Must be one of: Research, Development, Consultancy, Training

## Testing

### 1. Insert Test Data
- Navigate to http://localhost:8080/test-data.html
- Click "Insert Test Data" to populate the database with sample projects
- Click "View All Data" to verify the data was inserted correctly

### 2. Test Search Functionality
- Use the main application to search for projects
- Try different filter combinations
- Verify that search results match the criteria

### 3. Test CRUD Operations
- Create new project submissions
- View existing submissions
- Update submission details
- Delete submissions

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Verify MongoDB is running
   - Check environment variables
   - Ensure network connectivity

2. **CORS Issues**
   - The application is configured to allow requests from localhost:3000 and localhost:8080
   - If using a different port, update the CORS configuration

3. **Validation Errors**
   - Check that all required fields are filled
   - Ensure cost calculations are correct
   - Verify date format is YYYY-MM-DD

4. **Frontend Not Loading**
   - Ensure the backend is running on port 8080
   - Check browser console for JavaScript errors
   - Verify all CDN resources are accessible

### Logs
Check the application logs for detailed error information:
```bash
tail -f logs/application.log
```

## Performance Considerations

- **Pagination**: Use pagination for large datasets (default page size: 10)
- **Indexing**: MongoDB automatically indexes the `_id` field
- **Caching**: Consider implementing Redis for frequently accessed data
- **Connection Pooling**: MongoDB connection pooling is configured by default

## Security Features

- **Input Validation**: Comprehensive server-side validation
- **CORS Configuration**: Restricted to specific origins
- **Error Handling**: Secure error messages that don't expose sensitive information
- **Data Sanitization**: All inputs are validated and sanitized

## Future Enhancements

- **User Authentication**: JWT-based authentication system
- **Role-based Access Control**: Different permission levels for users
- **File Upload**: Support for project documents and attachments
- **Email Notifications**: Automated notifications for project status changes
- **Reporting**: Advanced reporting and analytics dashboard
- **Audit Trail**: Track all changes to project submissions

## Support

For technical support or questions about the system, please refer to the code comments or create an issue in the project repository.

## License

This project is developed for educational and organizational use.
