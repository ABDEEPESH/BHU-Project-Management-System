<!-- Logo -->
<p align="center">
  <img src="../../employee-project-frontend-cra/public/bhu-logo-header.png" alt="BHU Logo" height="90" />
</p>

# End-to-End User Flow (Auth → Submission → Project → Receipt → Expenditure)

References
- Security: `ProjecrSubmission/ProjecrSubmission/src/main/java/dev/deepesh/ProjecrSubmission/Security/`
- Error handling: `.../exception/GlobalExceptionHandler.java`, `.../exception/ApiError.java`
- Controllers: Employee, ProjectSubmission, Project, FundReceipt, FundExpenditure, ProjectReceived, FundingAgency, PFMSDetails, BankDetails

```mermaid
sequenceDiagram
  autonumber
  actor U as User
  participant FE as Frontend (CRA)
  participant AUTH as AuthController (/api/auth)
  participant API as Backend API (Controllers)
  participant SEC as Security (JWT filter)
  participant EH as GlobalExceptionHandler
  participant DB as MongoDB

  rect rgba(245,245,255,0.5)
  Note over U,AUTH: Authentication
  U->>FE: Enter credentials
  FE->>AUTH: POST /api/auth/login { username, password }
  AUTH->>SEC: authenticate -> AuthenticationManager
  alt ok
    AUTH-->>FE: 200 { token }
  else bad creds
    AUTH-->>FE: 400 ApiError("Invalid credentials")
  end
  end

  rect rgba(245,255,245,0.5)
  Note over FE,API: Project Submission (protected)
  FE->>API: POST /api/project-submission/create (Authorization: Bearer)
  SEC->>API: Validate JWT & roles (ADMIN|FORM)
  alt missing/invalid token
    SEC-->>FE: 401/403 ApiError
  else ok
    API->>DB: insert submission
    DB-->>API: saved
    API-->>FE: 201 entity
  end

  FE->>API: PUT /api/project-submission/{Employee_ID}
  SEC->>API: Validate JWT & roles
  alt not found in DB
    API->>EH: throw ResourceNotFoundException
    EH-->>FE: 404 ApiError("not found")
  else validation fails
    API->>EH: MethodArgumentNotValidException
    EH-->>FE: 400 ApiError(validations)
  else ok
    API->>DB: update
    API-->>FE: 200 entity
  end
  end

  rect rgba(245,245,255,0.5)
  Note over FE,API: Project (protected create; public reads unless tightened)
  FE->>API: POST /api/project/create (Bearer)
  SEC->>API: check roles (ADMIN|FORM)
  API->>DB: insert Project
  API-->>FE: 201 entity | 400 ApiError

  FE->>API: GET /api/project/code/{code}
  API->>DB: find by code
  alt not found
    API-->>FE: 404 ApiError
  else ok
    API-->>FE: 200 entity
  end
  end

  rect rgba(255,245,245,0.5)
  Note over FE,API: Fund Receipt (protected create/update; admin-only delete)
  FE->>API: POST /api/fund-receipt/create (Bearer)
  SEC->>API: roles (ADMIN|FORM)
  API->>DB: insert receipt
  API-->>FE: 201 entity | 400 ApiError

  FE->>API: PUT /api/fund-receipt/{id} (Bearer)
  SEC->>API: roles (ADMIN|FORM)
  API->>DB: update
  alt validation error
    API->>EH: MethodArgumentNotValidException
    EH-->>FE: 400 ApiError(validations)
  else ok
    API-->>FE: 200 entity
  end

  FE->>API: DELETE /api/fund-receipt/{id} (Bearer)
  SEC->>API: role ADMIN
  alt not admin
    SEC-->>FE: 403 ApiError
  else ok
    API->>DB: delete
    API-->>FE: 200/204
  end
  end

  rect rgba(245,245,255,0.5)
  Note over FE,API: Fund Expenditure (protected; admin-only delete)
  FE->>API: POST /api/fund-expenditure/create (Bearer)
  SEC->>API: roles (ADMIN|FORM)
  API->>DB: insert
  API-->>FE: 201 entity | 400 ApiError

  FE->>API: PUT /api/fund-expenditure/{id} (Bearer)
  SEC->>API: roles (ADMIN|FORM)
  API->>DB: update
  API-->>FE: 200 entity | 404 ApiError

  FE->>API: DELETE /api/fund-expenditure/{id} (Bearer)
  SEC->>API: role ADMIN
  API->>DB: delete
  API-->>FE: 204 | 500 ApiError
  end
```

Notes
- All mutating endpoints use `@PreAuthorize` for `ADMIN|FORM` and delete operations require `ADMIN`.
- Global errors are returned in `ApiError` format with consistent fields.
- JWT is validated by `JwtAuthFilter` and roles come from `UserAccount.roles`.
