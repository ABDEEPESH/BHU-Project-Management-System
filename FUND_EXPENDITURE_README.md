# Fund Expenditure Management System

## Overview

This document describes the new Fund Expenditure feature that has been added to the BHU Project Management System. The feature allows users to track and manage project expenditures with detailed breakdowns.

## Features Added

### 1. Fund Expenditure Management

#### Backend Components
- **Model**: `FundExpenditure.java` - Data model for fund expenditures
- **Repository**: `FundExpenditureRepository.java` - Database operations
- **Service**: `FundExpenditureService.java` - Business logic
- **Controller**: `FundExpenditureController.java` - REST API endpoints

#### Frontend Components
- **Form**: `FundExpenditureForm.tsx` - Create new expenditures
- **List**: `FundExpenditureList.tsx` - View and manage expenditures
- **Confirmation**: `FundExpenditureConfirmation.tsx` - Success confirmation page

### 2. Dark Mode Support

#### Components
- **Context**: `DarkModeContext.tsx` - Global dark mode state management
- **Toggle**: `DarkModeToggle.tsx` - Dark mode switch component
- **Styles**: Enhanced CSS with dark mode support

## Fund Expenditure Data Structure

### Fields
- **Project Code**: String (e.g., "PROJ-0001") - Links to existing projects
- **Financial Year**: String (e.g., "2026-27") - Format: YYYY-YY
- **Equipment Purchase**: Number (₹) - Equipment and materials
- **Salary**: Number (₹) - Personnel costs
- **Contingency**: Number (₹) - Contingency expenses
- **Overhead**: Number (₹) - Overhead costs
- **Total Expenditure**: Number (₹) - Auto-calculated sum
- **Date of Expenditure**: Date - When the expenditure occurred
- **Remarks**: String - Additional notes
- **Timestamp**: Date - System creation timestamp

### Validation Rules
- Project code must exist in the system
- Financial year must be in YYYY-YY format
- All amounts must be zero or positive
- At least one expenditure amount must be greater than zero
- No duplicate expenditures for same project code and financial year

## API Endpoints

### Fund Expenditure Endpoints
- `POST /api/fund-expenditure/create` - Create new expenditure
- `GET /api/fund-expenditure/all` - Get all expenditures
- `GET /api/fund-expenditure/{id}` - Get expenditure by ID
- `GET /api/fund-expenditure/project/{projectCode}` - Get by project code
- `GET /api/fund-expenditure/financial-year/{financialYear}` - Get by financial year
- `GET /api/fund-expenditure/project/{projectCode}/financial-year/{financialYear}` - Get by both
- `PUT /api/fund-expenditure/{id}` - Update expenditure
- `DELETE /api/fund-expenditure/{id}` - Delete expenditure
- `GET /api/fund-expenditure/exists/project/{projectCode}/financial-year/{financialYear}` - Check existence

## Frontend Routes

### Fund Expenditure Routes
- `/fund-expenditure` - View all expenditures
- `/fund-expenditure/create` - Create new expenditure
- `/fund-expenditure-confirmation` - Success confirmation page

## Dark Mode Features

### Implementation
- **System Preference Detection**: Automatically detects user's system theme preference
- **Persistent Storage**: Saves user preference in localStorage
- **Smooth Transitions**: CSS transitions for theme switching
- **Comprehensive Styling**: Dark mode styles for all components

### Supported Components
- Navigation bar
- Cards and forms
- Tables and lists
- Buttons and inputs
- Alerts and modals
- Custom purple theme for Fund Expenditure

## Usage Instructions

### Creating a Fund Expenditure
1. Navigate to the home page
2. Click on "Fund Expenditure" section
3. Click "Add Expenditure"
4. Fill in the required fields:
   - Enter a valid project code (e.g., "PROJ-0001")
   - Enter financial year in YYYY-YY format (e.g., "2026-27")
   - Enter amounts for equipment, salary, contingency, and overhead
   - Add optional date and remarks
5. Click "Create Fund Expenditure"
6. Review the confirmation page

### Viewing Expenditures
1. Navigate to "Fund Expenditure" section
2. Click "View Expenditures"
3. Use search and filter options:
   - Search by project code or financial year
   - Filter by specific financial year
   - Sort by project code, financial year, or total amount
4. View detailed breakdown of each expenditure

### Using Dark Mode
1. Click the dark mode toggle in the navigation bar
2. The theme will switch immediately
3. Your preference will be saved for future visits
4. The system will respect your system preference by default

## Technical Implementation

### Backend Technologies
- **Spring Boot**: Main framework
- **MongoDB**: Database
- **Spring Data MongoDB**: Data access
- **Swagger**: API documentation
- **Validation**: Bean validation annotations

### Frontend Technologies
- **React**: UI framework
- **TypeScript**: Type safety
- **Bootstrap**: CSS framework
- **React Router**: Navigation
- **Axios**: HTTP client
- **Context API**: State management

### Database Schema
```javascript
{
  _id: ObjectId,
  projectCode: String,
  financialYear: String,
  equipmentPurchase: Number,
  salary: Number,
  contingency: Number,
  overhead: Number,
  totalExpenditure: Number,
  dateOfExpenditure: Date,
  timestamp: Date,
  remark: String
}
```

## Testing

### Backend Tests
- Unit tests for service layer
- Integration tests for controller
- Validation tests for data integrity

### Frontend Tests
- Component rendering tests
- Form validation tests
- API integration tests

## Future Enhancements

### Planned Features
- Export functionality (PDF, Excel)
- Advanced reporting and analytics
- Budget vs actual comparison
- Multi-year expenditure tracking
- Approval workflow
- Email notifications

### UI/UX Improvements
- Interactive charts and graphs
- Drag-and-drop file uploads
- Real-time collaboration
- Mobile app version
- Offline support

## Troubleshooting

### Common Issues
1. **Project Code Not Found**: Ensure the project code exists in the system
2. **Invalid Financial Year**: Use YYYY-YY format (e.g., "2026-27")
3. **Duplicate Expenditure**: Each project can have only one expenditure per financial year
4. **Dark Mode Not Working**: Clear browser cache and localStorage

### Support
For technical support or feature requests, please contact the development team.

## Version History

### v1.0.0 (Current)
- Initial implementation of Fund Expenditure feature
- Dark mode support
- Basic CRUD operations
- Search and filter functionality
- Responsive design

---

**Note**: This feature is fully integrated with the existing BHU Project Management System and follows the same design patterns and coding standards.
