<!-- Logo -->
<p align="center">
  <img src="../employee-project-frontend-cra/public/bhu-logo-header.png" alt="BHU Logo" height="80" />
</p>

# Domain Model (Overview)

```mermaid
classDiagram
  direction LR
  class Employee {
    +String _id
    +String idNo
    +String name
    +String email
  }
  class Project {
    +String _id
    +String projectCode
    +String title
    +Number totalCost
  }
  class ProjectSubmission {
    +String _id
    +String employeeId
    +String projectCode
    +String title
    +Date submissionDate
  }
  class ProjectReceived {
    +String _id
    +String employeeId
    +String projectName
    +Number amountReceived
  }
  class FundingAgency {
    +String _id
    +String fundingAgencyId
    +String name
    +String category
  }
  class FundReceipt {
    +String _id
    +String idNo
    +String projectNumber
    +String receiptNumber
    +Number amount
  }
  class FundExpenditure {
    +String _id
    +String projectCode
    +String projectTitle
    +Number amount
  }
  class BankDetails {
    +String _id
    +String bankName
    +String accountNumber
    +String ifsc
  }
  class PFMSDetails {
    +String _id
    +String pfmsScheme
    +String schemeCode
    +Boolean active
  }

  Employee "1" --> "*" ProjectSubmission : submits
  Employee "1" --> "*" ProjectReceived : receives

  Project "1" --> "*" FundReceipt : receipts
  Project "1" --> "*" FundExpenditure : expenditures

  FundingAgency "1" --> "*" Project : funds

  ProjectSubmission --> Project : references
  ProjectReceived --> Project : references

  BankDetails --> Employee : belongs to
  PFMSDetails --> Project : classifies
```

Notes:
- Attributes are illustrative; actual fields are defined in `ProjecrSubmission/Model/*.java`.
- Relationships reflect typical usage inferred from controllers and repositories.
