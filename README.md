# Project Submission System

A full-stack application for managing employee project submissions with a Spring Boot backend and React frontend.

## Project Structure

```
ProjectSubmissionClient/
├── ProjecrSubmission/                 # Backend (Spring Boot)
│   └── ProjecrSubmission/
│       ├── src/main/java/dev/deepesh/ProjecrSubmission/
│       │   ├── Controller/            # REST API endpoints
│       │   ├── Model/                 # MongoDB entities
│       │   ├── Service/               # Business logic
│       │   └── Repository/            # Data access layer
│       └── pom.xml                    # Maven dependencies
├── employee-project-frontend-cra/      # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/                # React components
│   │   ├── services/                  # API service layer
│   │   └── types.ts                   # TypeScript interfaces
│   └── package.json                   # Node.js dependencies
└── start-project.bat                  # Windows startup script
```

## Prerequisites

- **Java 17** (for Spring Boot backend)
- **Node.js 16+** (for React frontend)
- **MongoDB** (running locally or accessible)
- **Maven** (for building backend)

## Quick Start

### Option 1: Use the Startup Script (Windows)
1. Double-click `start-project.bat`
2. This will start both backend and frontend in separate command windows

### Option 2: Manual Startup

#### Backend (Spring Boot)
```bash
cd ProjecrSubmission/ProjecrSubmission
mvn spring-boot:run
```
Backend will start on: http://localhost:8080

#### Frontend (React)
```bash
cd employee-project-frontend-cra
npm install
npm start
```
Frontend will start on: http://localhost:3000

## Backend API Endpoints

### Project Submissions
- `GET /api/project-submission/all` - Get all project submissions
- `POST /api/project-submission/create` - Create new submission
- `GET /api/project-submission/{id}` - Get submission by ID
- `PUT /api/project-submission/{id}` - Update submission
- `DELETE /api/project-submission/{id}` - Delete submission

### Other Endpoints
- `GET /api/employee` - Get all employees
- `GET /api/funding-agencies` - Get all funding agencies
- `GET /api/project-received` - Get all received projects

## Frontend Features

- **Project Submission Management**: View, create, edit, delete submissions
- **Employee Management**: Manage employee information
- **Funding Agency Management**: Handle funding agency data
- **Project Received Tracking**: Track received projects
- **Search & Filter**: Advanced search across all fields
- **Responsive Design**: Bootstrap-based UI with mobile support

## Database Configuration

The backend uses MongoDB. Update `ProjecrSubmission/ProjecrSubmission/src/main/resources/application.properties`:

```properties
# MongoDB Configuration
spring.data.mongodb.database=projectsubmission
spring.data.mongodb.uri=mongodb://localhost:27017/projectsubmission
```

## Troubleshooting

### Common Issues

1. **Backend won't start**
   - Check if MongoDB is running
   - Verify Java 17 is installed: `java -version`
   - Check port 8080 is available

2. **Frontend won't start**
   - Verify Node.js is installed: `node --version`
   - Run `npm install` in the frontend directory
   - Check port 3000 is available

3. **API connection errors**
   - Ensure backend is running on port 8080
   - Check CORS configuration in backend
   - Verify API endpoints match between frontend and backend

### Logs
- Backend logs appear in the Spring Boot console
- Frontend logs appear in the browser console (F12)
- API request/response logs are in the browser console

## Development

### Backend
- Built with Spring Boot 3.5.3
- Uses MongoDB with Spring Data
- RESTful API with Swagger documentation
- Validation and error handling

### Frontend
- Built with React 18 + TypeScript
- Uses Bootstrap 5 for styling
- Axios for API communication
- React Router for navigation

## API Documentation

Once the backend is running, visit: http://localhost:8080/swagger-ui.html

This provides interactive API documentation for all endpoints.

## Project Submission System - Comprehensive Documentation

### Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Security Implementation](#security-implementation)
4. [Equipment Module](#equipment-module)
5. [Dual-Admin Approval System](#dual-admin-approval-system)
6. [API Documentation](#api-documentation)
7. [Frontend Implementation](#frontend-implementation)
8. [Deployment Guide](#deployment-guide)
9. [Architectural Diagrams](#architectural-diagrams)
10. [Decision Tables](#decision-tables)

### System Overview

The Project Submission System is a comprehensive web application designed for managing project submissions, equipment tracking, and administrative workflows with enhanced security features. The system implements a dual-admin approval mechanism for critical operations and provides JWT-based authentication with role-based access control.

### Key Features
- **Equipment Management**: Complete CRUD operations for equipment tracking
- **Dual-Admin Security**: Two-factor admin approval for create/add operations
- **JWT Authentication**: Secure token-based authentication system
- **Role-Based Access**: Granular permissions for different user types
- **Modern UI**: Responsive design with dark mode support
- **API Documentation**: Comprehensive Swagger/OpenAPI documentation
- **MongoDB Integration**: NoSQL database for flexible data storage

### Technology Stack
- **Backend**: Spring Boot 3.x, Spring Security, MongoDB
- **Frontend**: React 18, TypeScript, Bootstrap 5
- **Authentication**: JWT (JSON Web Tokens)
- **Database**: MongoDB Atlas
- **Documentation**: Swagger/OpenAPI 3
- **Build Tools**: Maven, npm

### Architecture

### System Architecture Overview
The system follows a modern three-tier architecture pattern:

1. **Presentation Layer**: React-based frontend with TypeScript
2. **Business Logic Layer**: Spring Boot REST API with security
3. **Data Access Layer**: MongoDB with Spring Data repositories

### Component Structure
```
Project Submission System
├── Frontend (React + TypeScript)
│   ├── Components (Forms, UI Elements)
│   ├── Services (API Integration)
│   ├── Context (Authentication, Theme)
│   └── Routing (Protected Routes)
├── Backend (Spring Boot)
│   ├── Controllers (REST Endpoints)
│   ├── Services (Business Logic)
│   ├── Repositories (Data Access)
│   ├── Models (Data Entities)
│   └── Security (JWT, RBAC)
└── Database (MongoDB)
    ├── Collections (Projects, Equipment, Users)
    └── Indexes (Performance Optimization)
```

### Security Implementation

### JWT Authentication Flow
1. User submits credentials to `/api/auth/login`
2. System validates credentials against MongoDB
3. JWT token generated with user roles and expiration
4. Token included in Authorization header for subsequent requests
5. JWT filter validates token on each protected endpoint

### Dual-Admin Approval System
The system implements a sophisticated dual-admin approval mechanism:

#### Key Components
- **DualAdminApprovalService**: Manages approval workflow
- **Approval Tracking**: Monitors pending approvals with expiration
- **Admin Validation**: Ensures two distinct admin approvals
- **Security Integration**: Integrated with JWT and role-based access

#### Approval Process
1. First admin initiates create/add operation
2. System creates pending approval record
3. Second admin must approve within time limit
4. Operation proceeds only after dual approval
5. Expired approvals are automatically cleaned up

### Security Configuration
```java
// Security rules
.authorizeHttpRequests(auth -> auth
    .requestMatchers(HttpMethod.GET, "/api/**").permitAll()  // Open read access
    .requestMatchers("/api/auth/**", "/swagger-ui/**").permitAll()
    .anyRequest().authenticated()  // Protect write operations
)
```

### Equipment Module

### Equipment Entity Structure
```java
public class Equipment {
    private String id;
    private String voucherNumber;    // Unique identifier
    private String manufactureName;   // Equipment manufacturer
    private String equipmentName;     // Equipment description
    private String caste;            // Equipment category
    private LocalDate date;          // Purchase/receipt date
    private String projectNumber;    // Associated project
    private String projectTitle;     // Auto-populated
    private String employeeId;       // Responsible employee
    private String employeeName;     // Auto-populated
}
```

### Equipment API Endpoints
- `POST /api/equipment/create` - Create new equipment (requires dual-admin approval)
- `GET /api/equipment` - List all equipment
- `GET /api/equipment/voucher/{voucherNumber}` - Get by voucher number
- `GET /api/equipment/project/{projectNumber}` - Get by project
- `GET /api/equipment/approval/{approvalId}` - Check approval status

### Equipment Form Features
- **Auto-population**: Project title and employee name fetched automatically
- **Date Picker**: Modern date selection interface
- **Validation**: Client and server-side validation
- **Responsive Design**: Mobile-friendly interface
- **Real-time Feedback**: Instant validation and error messages

### Dual-Admin Approval System

### Approval Workflow
```mermaid
sequenceDiagram
    participant A1 as Admin 1
    participant S as System
    participant A2 as Admin 2
    participant DB as Database
    
    A1->>S: Create Equipment Request
    S->>DB: Create Pending Approval
    S->>A1: Return Approval ID (202)
    A2->>S: Approve with Approval ID
    S->>DB: Validate & Complete Approval
    S->>DB: Create Equipment Record
    S->>A2: Success Response (201)
```

### Approval Service Features
- **Expiration Management**: Automatic cleanup of expired approvals
- **Admin Validation**: Prevents self-approval scenarios
- **Audit Trail**: Complete tracking of approval history
- **Concurrent Safety**: Thread-safe approval processing

### API Documentation

### Swagger Integration
The system provides comprehensive API documentation through Swagger UI:

- **URL**: `http://localhost:8080/swagger-ui.html`
- **JWT Support**: Built-in authentication testing
- **Interactive Testing**: Try endpoints directly from documentation
- **Schema Documentation**: Complete request/response models

### Authentication in Swagger
1. Navigate to Swagger UI
2. Click "Authorize" button
3. Login via `/api/auth/login` to get JWT token
4. Enter token in format: `Bearer <your-jwt-token>`
5. Test protected endpoints with authentication

### Frontend Implementation

### React Component Architecture
```
src/
├── components/
│   ├── forms/
│   │   ├── EquipmentForm.tsx
│   │   ├── ProjectForm.tsx
│   │   └── FundingAgencyForm.tsx
│   ├── common/
│   │   ├── Navigation.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── LoadingSpinner.tsx
│   └── layout/
│       ├── Header.tsx
│       └── Footer.tsx
├── services/
│   ├── api.ts
│   ├── auth.ts
│   └── types.ts
├── contexts/
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
└── styles/
    ├── App.css
    └── darkMode.css
```

### State Management
- **Authentication Context**: Global auth state management
- **Theme Context**: Dark/light mode switching
- **Form State**: Local component state with validation
- **API State**: Loading, error, and success states

### UI/UX Features
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Complete theme switching
- **Loading States**: User feedback during operations
- **Form Validation**: Real-time validation with visual feedback
- **Accessibility**: ARIA labels and keyboard navigation

### Deployment Guide

### Prerequisites
- Java 17+
- Node.js 18+
- MongoDB Atlas account
- Maven 3.6+

### Backend Deployment
1. **Configure Database**:
   ```properties
   spring.data.mongodb.uri=mongodb+srv://username:password@cluster.mongodb.net/database
   ```

2. **Build Application**:
   ```bash
   cd ProjecrSubmission/ProjecrSubmission
   mvn clean package
   ```

3. **Run Application**:
   ```bash
   java -jar target/ProjecrSubmission-0.0.1-SNAPSHOT.jar
   ```

### Frontend Deployment
1. **Install Dependencies**:
   ```bash
   cd employee-project-frontend-cra
   npm install
   ```

2. **Build for Production**:
   ```bash
   npm run build
   ```

3. **Deploy**:
   ```bash
   npm start  # Development
   # or serve build folder for production
   ```

### Environment Configuration
```bash
# Backend (.env or application.properties)
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
JWT_EXPIRATION=86400000

# Frontend (.env)
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_JWT_EXPIRY=24h
```

### Architectural Diagrams

### 1. Context Data Flow Diagram (Level 0)

```
                    ┌─────────────────┐
                    │                 │
                    │     USERS       │
                    │  (Admin/Staff)  │
                    │                 │
                    └────────┬────────┘
                             │
                             ▼
    ┌────────────────────────────────────────────────────────┐
    │                                                        │
    │           PROJECT SUBMISSION SYSTEM                    │
    │                                                        │
    │  • Equipment Management                                │
    │  • Dual-Admin Approval                                 │
    │  • JWT Authentication                                  │
    │  • Project Tracking                                    │
    │                                                        │
    └────────────┬───────────────────────────┬───────────────┘
                 │                           │
                 ▼                           ▼
    ┌─────────────────┐              ┌─────────────────┐
    │                 │              │                 │
    │   MONGODB       │              │   SWAGGER UI    │
    │   DATABASE      │              │   DOCUMENTATION │
    │                 │              │                 │
    └─────────────────┘              └─────────────────┘
```

### 2. Level 1 Data Flow Diagram

```
                           ┌─────────────┐
                           │    ADMIN    │
                           │   USERS     │
                           └──────┬──────┘
                                  │
                                  ▼
    ┌─────────────────────────────────────────────────────────────┐
    │                                                             │
    │                    WEB APPLICATION                          │
    │                                                             │
    │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
    │  │             │  │             │  │                     │ │
    │  │ EQUIPMENT   │  │    AUTH     │  │     NAVIGATION      │ │
    │  │ MANAGEMENT  │  │  SYSTEM     │  │    COMPONENT        │ │
    │  │             │  │             │  │                     │ │
    │  └─────────────┘  └─────────────┘  └─────────────────────┘ │
    │         │                 │                    │            │
    └─────────┼─────────────────┼────────────────────┼────────────┘
              │                 │                    │
              ▼                 ▼                    ▼
    ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
    │                 │ │                 │ │                 │
    │   EQUIPMENT     │ │     USER        │ │   APPROVAL      │
    │  COLLECTION     │ │  COLLECTION     │ │  COLLECTION     │
    │                 │ │                 │ │                 │
    └─────────────────┘ └─────────────────┘ └─────────────────┘
```

### 3. System Structure Chart

```
                    ┌─────────────────────────┐
                    │                         │
                    │    MAIN APPLICATION     │
                    │     (Spring Boot)       │
                    │                         │
                    └────────────┬────────────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
                ▼                ▼                ▼
    ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
    │                 │ │                 │ │                 │
    │   CONTROLLER    │ │    SECURITY     │ │    SERVICE      │
    │     LAYER       │ │     LAYER       │ │     LAYER       │
    │                 │ │                 │ │                 │
    └────────┬────────┘ └────────┬────────┘ └────────┬────────┘
             │                   │                   │
             ▼                   ▼                   ▼
    ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
    │                 │ │                 │ │                 │
    │ Equipment       │ │ JWT Filter      │ │ Equipment       │
    │ Controller      │ │ Auth Manager    │ │ Service         │
    │ Project         │ │ User Details    │ │ Project         │
    │ Controller      │ │ Service         │ │ Service         │
    │                 │ │                 │ │                 │
    └─────────────────┘ └─────────────────┘ └────────┬────────┘
                                                     │
                                                     ▼
                                          ┌─────────────────┐
                                          │                 │
                                          │  REPOSITORY     │
                                          │     LAYER       │
                                          │                 │
                                          └────────┬────────┘
                                                   │
                                                   ▼
                                          ┌─────────────────┐
                                          │                 │
                                          │    MONGODB      │
                                          │   DATABASE      │
                                          │                 │
                                          └─────────────────┘
```

### 4. Component Diagram

```
    ┌─────────────────────────────────────────────────────────────┐
    │                    FRONTEND (React)                         │
    │                                                             │
    │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
    │  │             │  │             │  │                     │ │
    │  │ Equipment   │  │    Auth     │  │     Navigation      │ │
    │  │   Form      │  │  Context    │  │    Component        │ │
    │  │             │  │             │  │                     │ │
    │  └─────────────┘  └─────────────┘  └─────────────────────┘ │
    │                                                             │
    └─────────────────────┬───────────────────────────────────────┘
                          │ HTTPS/WSS
                          ▼
    ┌─────────────────────────────────────────────────────────────┐
    │                   BACKEND (Spring Boot)                     │
    │                                                             │
    │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
    │  │             │  │             │  │                     │ │
    │  │ Equipment   │  │    JWT      │  │   Dual-Admin        │ │
    │  │ Controller  │  │   Filter    │  │   Approval          │ │
    │  │             │  │             │  │   Service           │ │
    │  └─────────────┘  └─────────────┘  └─────────────────────┘ │
    │         │                                    │              │
    │         ▼                                    ▼              │
    │  ┌─────────────┐                    ┌─────────────────────┐ │
    │  │             │                    │                     │ │
    │  │ Equipment   │                    │    Security         │ │
    │  │  Service    │                    │    Config           │ │
    │  │             │                    │                     │ │
    │  └─────────────┘                    └─────────────────────┘ │
    │         │                                                   │
    │         ▼                                                   │
    │  ┌─────────────┐                                           │
    │  │             │                                           │
    │  │ Equipment   │                                           │
    │  │ Repository  │                                           │
    │  │             │                                           │
    │  └─────────────┘                                           │
    │                                                             │
    └─────────────────────┬───────────────────────────────────────┘
                          │ MongoDB Protocol
                          ▼
    ┌─────────────────────────────────────────────────────────────┐
    │                     MONGODB                                 │
    │                                                             │
    │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
    │  │             │  │             │  │                     │ │
    │  │ Equipment   │  │    Users    │  │     Approvals       │ │
    │  │ Collection  │  │ Collection  │  │    Collection       │ │
    │  │             │  │             │  │                     │ │
    │  └─────────────┘  └─────────────┘  └─────────────────────┘ │
    │                                                             │
    └─────────────────────────────────────────────────────────────┘
```

### 5. Deployment Diagram

```
    ┌─────────────────────────────────────────────────────────────┐
    │                    CLIENT BROWSER                           │
    │                                                             │
    │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
    │  │             │  │             │  │                     │ │
    │  │   React     │  │    Local    │  │      Service        │ │
    │  │    App      │  │  Storage    │  │      Worker         │ │
    │  │             │  │   (JWT)     │  │                     │ │
    │  └─────────────┘  └─────────────┘  └─────────────────────┘ │
    │                                                             │
    └─────────────────────┬───────────────────────────────────────┘
                          │ HTTPS/WSS
                          ▼
    ┌─────────────────────────────────────────────────────────────┐
    │                   WEB SERVER                                │
    │                                                             │
    │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
    │  │             │  │             │  │                     │ │
    │  │   Nginx     │  │    SSL      │  │    Load Balancer    │ │
    │  │  (Reverse   │  │ Certificate │  │                     │ │
    │  │   Proxy)    │  │             │  │                     │ │
    │  └─────────────┘  └─────────────┘  └─────────────────────┘ │
    │                                                             │
    └─────────────────────┬───────────────────────────────────────┘
                          │ HTTP
                          ▼
    ┌─────────────────────────────────────────────────────────────┐
    │                APPLICATION SERVER                           │
    │                                                             │
    │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
    │  │             │  │             │  │                     │ │
    │  │ Spring Boot │  │    JVM      │  │     Embedded        │ │
    │  │ Application │  │   Runtime   │  │     Tomcat          │ │
    │  │             │  │             │  │                     │ │
    │  └─────────────┘  └─────────────┘  └─────────────────────┘ │
    │                                                             │
    └─────────────────────┬───────────────────────────────────────┘
                          │ MongoDB Protocol
                          ▼
    ┌─────────────────────────────────────────────────────────────┐
    │                   DATABASE SERVER                           │
    │                                                             │
    │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
    │  │             │  │             │  │                     │ │
    │  │  MongoDB    │  │   Replica   │  │      Backup         │ │
    │  │   Atlas     │  │    Set      │  │     Service         │ │
    │  │             │  │             │  │                     │ │
    │  └─────────────┘  └─────────────┘  └─────────────────────┘ │
    │                                                             │
    └─────────────────────────────────────────────────────────────┘
```

### 6. State Chart Diagram - Equipment Creation

```
    ┌─────────────┐
    │             │
    │   INITIAL   │
    │             │
    └──────┬──────┘
           │ User starts form
           ▼
    ┌─────────────┐
    │             │
    │ FORM_ENTRY  │
    │             │
    └──────┬──────┘
           │ Form submitted
           ▼
    ┌─────────────┐
    │             │
    │ VALIDATING  │
    │             │
    └──────┬──────┘
           │ Validation passed
           ▼
    ┌─────────────┐
    │             │
    │ PENDING_    │
    │ APPROVAL    │
    │             │
    └──────┬──────┘
           │ Second admin approves
           ▼
    ┌─────────────┐
    │             │
    │  APPROVED   │
    │             │
    └──────┬──────┘
           │ Equipment created
           ▼
    ┌─────────────┐
    │             │
    │  COMPLETED  │
    │             │
    └─────────────┘

    Error States:
    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
    │             │    │             │    │             │
    │ VALIDATION_ │    │ APPROVAL_   │    │   EXPIRED   │
    │   ERROR     │    │  REJECTED   │    │             │
    │             │    │             │    │             │
    └─────────────┘    └─────────────┘    └─────────────┘
```

### 7. Activity Diagram - Dual Admin Approval Process

```
    ┌─────────────┐
    │    START    │
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │ Admin 1     │
    │ Submits     │
    │ Equipment   │
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │ System      │
    │ Validates   │
    │ Request     │
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │ Create      │
    │ Pending     │
    │ Approval    │
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │ Notify      │
    │ Admin 2     │
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │ Admin 2     │
    │ Reviews     │
    │ Request     │
    └──────┬──────┘
           │
           ▼
      ┌─────────┐
      │Approve? │
      └────┬────┘
           │
    ┌──────┴──────┐
    │ YES    NO   │
    ▼             ▼
┌─────────┐  ┌─────────────┐
│ Create  │  │   Reject    │
│Equipment│  │  Request    │
└────┬────┘  └──────┬──────┘
     │              │
     ▼              ▼
┌─────────┐  ┌─────────────┐
│SUCCESS  │  │   FAILED    │
└─────────┘  └─────────────┘
```

## Decision Tables

### 1. Equipment Creation Authorization

| Condition                    | Rule 1 | Rule 2 | Rule 3 | Rule 4 | Rule 5 |
|-----------------------------|--------|--------|--------|--------|--------|
| User has ADMIN role         |   Y    |   Y    |   Y    |   N    |   N    |
| First admin approval        |   Y    |   Y    |   N    |   -    |   -    |
| Second admin approval       |   Y    |   N    |   -    |   -    |   -    |
| Approval not expired        |   Y    |   Y    |   Y    |   -    |   -    |
| **Actions**                 |        |        |        |        |        |
| Create Equipment            |   X    |        |        |        |        |
| Request Second Approval     |        |   X    |        |        |        |
| Create Pending Approval     |        |        |   X    |        |        |
| Reject - Insufficient Role  |        |        |        |   X    |        |
| Reject - Invalid Request    |        |        |        |        |   X    |

### 2. API Access Control

| Condition                    | Rule 1 | Rule 2 | Rule 3 | Rule 4 | Rule 5 |
|-----------------------------|--------|--------|--------|--------|--------|
| Request Method is GET       |   Y    |   N    |   N    |   N    |   Y    |
| Valid JWT Token             |   Y    |   Y    |   N    |   Y    |   N    |
| User has ADMIN role         |   Y    |   Y    |   Y    |   N    |   N    |
| Endpoint requires auth      |   Y    |   Y    |   Y    |   Y    |   N    |
| **Actions**                 |        |        |        |        |        |
| Allow Access                |   X    |   X    |        |        |   X    |
| Deny - Insufficient Role    |        |        |        |   X    |        |
| Deny - Invalid Token        |        |        |   X    |        |        |
| Deny - Authentication Req   |        |        |        |        |        |

### 3. Form Validation Rules

| Condition                    | Rule 1 | Rule 2 | Rule 3 | Rule 4 | Rule 5 |
|-----------------------------|--------|--------|--------|--------|--------|
| Voucher Number Present      |   Y    |   Y    |   N    |   Y    |   Y    |
| Voucher Number Unique       |   Y    |   N    |   -    |   Y    |   Y    |
| Equipment Name Present      |   Y    |   Y    |   Y    |   N    |   Y    |
| Date is Valid               |   Y    |   Y    |   Y    |   Y    |   N    |
| Project Number Valid        |   Y    |   Y    |   Y    |   Y    |   Y    |
| **Actions**                 |        |        |        |        |        |
| Accept Form                 |   X    |        |        |        |        |
| Error - Duplicate Voucher   |        |   X    |        |        |        |
| Error - Missing Voucher     |        |        |   X    |        |        |
| Error - Missing Equipment   |        |        |        |   X    |        |
| Error - Invalid Date        |        |        |        |        |   X    |

### 4. User Authentication Flow

| Condition                    | Rule 1 | Rule 2 | Rule 3 | Rule 4 | Rule 5 |
|-----------------------------|--------|--------|--------|--------|--------|
| Username Exists             |   Y    |   Y    |   N    |   Y    |   Y    |
| Password Correct            |   Y    |   N    |   -    |   Y    |   Y    |
| Account Active              |   Y    |   Y    |   -    |   N    |   Y    |
| Rate Limit OK               |   Y    |   Y    |   -    |   Y    |   N    |
| **Actions**                 |        |        |        |        |        |
| Generate JWT Token          |   X    |        |        |        |        |
| Reject - Wrong Password     |        |   X    |        |        |        |
| Reject - User Not Found     |        |        |   X    |        |        |
| Reject - Account Disabled   |        |        |        |   X    |        |
| Reject - Rate Limited       |        |        |        |        |   X    |

## Conclusion

The Project Submission System represents a comprehensive solution for managing equipment and project data with enterprise-grade security features. The dual-admin approval system ensures critical operations require proper authorization, while the modern React frontend provides an intuitive user experience.

Key achievements:
- Complete Equipment module with CRUD operations
- Dual-admin approval system for enhanced security
- JWT-based authentication with role-based access
- Comprehensive API documentation with Swagger
- Modern, responsive UI with dark mode support
- Complete architectural documentation with diagrams

The system is production-ready and can be extended with additional modules following the established patterns and architectural principles.

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Authors**: Development Team  
**License**: MIT
"# BHU_Project_Managemnet_System" 
