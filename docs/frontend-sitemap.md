<!-- Logo -->
<p align="center">
  <img src="../employee-project-frontend-cra/public/bhu-logo-header.png" alt="BHU Logo" height="80" />
</p>

# Frontend Site Map / Navigation

```mermaid
flowchart TB
  classDef page fill:#f8fafc,stroke:#0ea5e9
  classDef act fill:#ecfeff,stroke:#0891b2

  Home((Dashboard)):::page
  Nav[Navigation Bar]:::act

  Home --> EmployeeList[Employees]:::page
  Home --> FundingAgencyList[Funding Agencies]:::page
  Home --> ProjectSubmissionList[Project Submissions]:::page
  Home --> ProjectReceivedList[Projects Received]:::page
  Home --> FundReceiptList[Fund Receipts]:::page
  Home --> FundExpenditureList[Fund Expenditures]:::page

  EmployeeList --> EmployeeForm
  FundingAgencyList --> FundingAgencyForm
  ProjectSubmissionList --> ProjectSubmissionForm --> ProjectSubmissionConfirmation
  ProjectReceivedList --> ProjectReceivedForm --> ProjectReceivedConfirmation
  FundReceiptList --> FundReceiptForm
  FundExpenditureList --> FundExpenditureForm --> FundExpenditureConfirmation
```

Notes:
- Reflects components under `employee-project-frontend-cra/src/components/` and `src/forms/`.
- Adjust labels to match any exact route names in your `App.tsx`.
