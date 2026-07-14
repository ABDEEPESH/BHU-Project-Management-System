<!-- Logo -->
<p align="center">
  <img src="../../employee-project-frontend-cra/public/bhu-logo-header.png" alt="BHU Logo" height="90" />
</p>

# BHU Project Management System – All Flows (Consolidated)

This document consolidates detailed, code-accurate flow diagrams for all backend controllers.

Contents
- Project Submission
- Fund Receipt
- Fund Expenditure
- Employee
- Funding Agency
- Project
- Project Received
- Health

Notes
- All controllers use CORS for localhost:3000/8080.
- Base package: `dev.deepesh.ProjecrSubmission.Controller`.

---

## Project Submission
Source: `ProjecrSubmission/ProjecrSubmission/src/main/java/dev/deepesh/ProjecrSubmission/Controller/ProjectSubmissionController.java`
Base path: `/api/project-submission`

```mermaid
sequenceDiagram
  autonumber
  actor U as Employee/User
  participant FE as Frontend (React CRA)
  participant API as ProjectSubmissionController
  participant SVC as ProjectSubmissionService
  participant REPO as ProjectSubmissionRepository
  participant DB as MongoDB

  U->>FE: Fill Submission Form
  FE->>API: POST /api/project-submission/create (JSON)
  API->>API: @Valid + BindingResult
  alt invalid
    API-->>FE: 400 {error}
  else ok
    API->>SVC: save(submission, bindingResult)
    SVC->>REPO: insert
    REPO->>DB: insert
    DB-->>REPO: _id
    REPO-->>SVC: saved
    SVC-->>API: entity
    API-->>FE: 201 entity
  end

  FE->>API: GET /search?filters&page&size
  API->>SVC: searchProjectSubmissions(..., Pageable)
  SVC->>REPO: filtered query
  REPO->>DB: find
  DB-->>REPO: Page<ProjectSubmission>
  API-->>FE: 200 Page

  FE->>API: PUT /{Employee_ID}
  API->>SVC: update(Employee_ID, submission, bindingResult)
  SVC->>REPO: save/update
  REPO->>DB: update
  API-->>FE: 200 entity | 400/500

  FE->>API: DELETE /{Employee_ID}
  API->>SVC: deleteById
  SVC->>REPO: deleteById
  API-->>FE: 200 {message} | 404
```

---

## Fund Receipt
Source: `Controller/FundReceiptController.java`
Base path: `/api/fund-receipt`

```mermaid
sequenceDiagram
  autonumber
  actor FO as Finance Officer
  participant FE as Frontend
  participant API as FundReceiptController
  participant SVC as FundReceiptService
  participant REPO as FundReceiptRepository
  participant DB as MongoDB

  FO->>FE: Enter receipt
  FE->>API: POST /create (JSON)
  API->>API: @Valid + BindingResult
  alt invalid
    API-->>FE: 400 {error}
  else ok
    API->>SVC: save(receipt, bindingResult)
    SVC->>REPO: insert
    REPO->>DB: insert
    DB-->>REPO: _id
    REPO-->>SVC: saved
    SVC-->>API: entity
    API-->>FE: 201 entity
  end

  FE->>API: GET /{id} | /employee/{idNo} | /project/{projectNumber}
  API->>SVC: service lookups
  SVC->>REPO: queries
  REPO->>DB: find
  API-->>FE: 200 entity/list | 404

  FE->>API: GET ?page&size | /all
  API->>SVC: pagination or list
  SVC->>REPO: findAll(Pageable)|findAll()
  API-->>FE: 200 Page|List

  FE->>API: PUT /{id}
  API->>SVC: update(id, receipt, bindingResult)
  SVC->>REPO: save/update
  API-->>FE: 200 entity | 400/500

  FE->>API: DELETE /{id} | /receipt-number/{no}
  API->>SVC: deleteById | deleteByReceiptNumber
  SVC->>REPO: delete
  API-->>FE: 200 {message} | 204 | 404
```

---

## Fund Expenditure
Source: `Controller/FundExpenditureController.java`
Base path: `/api/fund-expenditure`

```mermaid
sequenceDiagram
  autonumber
  actor FO as Finance Officer
  participant FE as Frontend
  participant API as FundExpenditureController
  participant SVC as FundExpenditureService
  participant REPO as FundExpenditureRepository
  participant DB as MongoDB

  FO->>FE: Enter expenditure
  FE->>API: POST /create (JSON)
  API->>API: @Valid
  alt invalid
    API-->>FE: 400
  else ok
    API->>SVC: createFundExpenditure(body)
    SVC->>REPO: insert
    REPO->>DB: insert
    DB-->>REPO: _id
    API-->>FE: 201 entity
  end

  FE->>API: GET /all | /{id}
  API->>SVC: getAll | getById
  SVC->>REPO: findAll | findById
  API-->>FE: 200 list|entity | 404

  FE->>API: GET /project/{code} | /financial-year/{fy} | /project/{code}/financial-year/{fy}
  API->>SVC: repo filters
  SVC->>REPO: findBy...
  API-->>FE: 200 list

  FE->>API: PUT /{id}
  API->>SVC: updateFundExpenditure(id, body)
  SVC->>REPO: save/update
  API-->>FE: 200 | 400 | 404

  FE->>API: DELETE /{id}
  API->>SVC: deleteFundExpenditure
  SVC->>REPO: deleteById
  API-->>FE: 204 | 500

  FE->>API: GET /exists/project/{code}/financial-year/{fy}
  API->>SVC: existsByProjectCodeAndFinancialYear
  SVC->>REPO: existsByProjectCodeAndFinancialYear
  API-->>FE: 200 {exists}
```

---

## Employee
Source: `Controller/EmployeeController.java`
Base path: `/api/employee`

```mermaid
sequenceDiagram
  autonumber
  actor U as User
  participant FE as Frontend
  participant API as EmployeeController
  participant SVC as EmployeeService
  participant REPO as EmployeeRepository
  participant DB as MongoDB

  FE->>API: POST /create (JSON)
  API->>API: @Valid + BindingResult
  alt invalid
    API-->>FE: 400 joined field errors
  else ok
    API->>SVC: save(employee, bindingResult)
    SVC->>REPO: insert
    REPO->>DB: insert
    API-->>FE: 201 entity | 400/500
  end

  FE->>API: GET /eid/{idNo}
  API->>SVC: findByIdNo
  SVC->>REPO: @Query{'ID No': ?0}
  REPO->>DB: findOne
  API-->>FE: 200 entity | 404

  FE->>API: GET /
  API->>SVC: findAll
  SVC->>REPO: findAll
  API-->>FE: 200 List

  FE->>API: GET /debug/count
  API->>SVC: getCount
  SVC->>REPO: count
  API-->>FE: 200 {totalCount}
```

---

## Funding Agency
Source: `Controller/FundingAgencyController.java`
Base path: `/api/funding-agencies`

```mermaid
sequenceDiagram
  autonumber
  actor PM as PM/Admin
  participant FE as Frontend
  participant API as FundingAgencyController
  participant SVC as FundingAgencyService
  participant REPO as FundingAgencyRepository

  FE->>API: POST /create (JSON)
  API->>API: @Valid + BindingResult
  API->>SVC: save(fundingAgency, bindingResult)
  SVC->>REPO: insert
  API-->>FE: 201 entity | 400

  FE->>API: GET /faId/{id} | /faName/{name}
  API->>SVC: findByFundingAgencyId | findByFundingAgencyName
  SVC->>REPO: repo methods
  API-->>FE: 200 entity | 404

  FE->>API: GET /
  API->>SVC: findAll
  SVC->>REPO: findAll
  API-->>FE: 200 List
```

---

## Project
Source: `Controller/ProjectController.java`
Base path: `/api/project`

```mermaid
sequenceDiagram
  autonumber
  participant FE as Frontend
  participant API as ProjectController
  participant SVC as ProjectService
  participant REPO as ProjectRepository

  FE->>API: POST /create (JSON)
  API->>API: @Valid + BindingResult
  alt invalid
    API-->>FE: 400 joined field errors
  else ok
    API->>SVC: save(project, bindingResult)
    SVC->>REPO: insert
    API-->>FE: 201 entity | 400/500
  end

  FE->>API: GET /code/{code} | /name/{name}
  API->>SVC: findByProjectCode | findByProjectName
  SVC->>REPO: repo queries
  API-->>FE: 200 entity | 404

  FE->>API: GET /
  API->>SVC: findAll
  SVC->>REPO: findAll
  API-->>FE: 200 List
```

---

## Project Received
Source: `Controller/ProjectReceivedController.java`
Base path: `/api/project-received`

```mermaid
sequenceDiagram
  autonumber
  participant FE as Frontend
  participant API as ProjectReceivedController
  participant SVC as ProjectReceivedService
  participant ES as EmployeeService
  participant REPO as ProjectReceivedRepository

  FE->>API: GET /
  API->>SVC: getAllProjectReceived()
  SVC->>REPO: findAll()
  REPO->>API: List<ProjectReceived>
  API-->>FE: 200 {projects,count, message?}

  FE->>API: GET /eid/{idNo}
  API->>SVC: getProjectReceivedByIdNo(idNo)
  SVC->>REPO: findByIdNo
  API-->>FE: 200 {projects,count} | 404 {error}

  FE->>API: GET /details/eid/{idNo}
  API->>SVC: getProjectReceivedByIdNo(idNo)
  SVC->>REPO: findByIdNo
  API->>ES: findByIdNo(idNo)
  API-->>FE: 200 {projects,count,employee} | 404

  FE->>API: POST /create (JSON)
  API->>API: @Valid
  API->>SVC: createProjectReceived(body)
  SVC->>REPO: insert
  API-->>FE: 201 entity | 400/500
```

---

## Health
Source: `Controller/HealthController.java`
Base path: `/api/health`

```mermaid
sequenceDiagram
  autonumber
  participant FE as Frontend
  participant API as HealthController
  participant MT as MongoTemplate
  participant EmpRepo as EmployeeRepository
  participant ProjRepo as ProjectRepository
  participant FARepo as FundingAgencyRepository

  FE->>API: GET /api/health
  API->>MT: getDb().getName()
  API->>EmpRepo: count()
  API->>ProjRepo: count()
  API->>FARepo: count()
  API-->>FE: 200 {status:UP, database, repositories{...}} | 500 {status:DOWN,error}

  FE->>API: GET /api/health/db-collections
  API->>MT: getCollectionNames()
  API-->>FE: 200 {collections,totalCollections} | 500
```
