<!-- Logo -->
<p align="center">
  <img src="../employee-project-frontend-cra/public/bhu-logo-header.png" alt="BHU Logo" height="80" />
</p>

# System Context Diagram

```mermaid
flowchart LR
  %% STYLE
  classDef ext fill:#fff7e6,stroke:#cc7000,stroke-width:1px,color:#333
  classDef svc fill:#e7f0ff,stroke:#1d4ed8,stroke-width:1px
  classDef db fill:#eefcef,stroke:#1b873f
  classDef fe fill:#f0f9ff,stroke:#0284c7
  classDef be fill:#f5f3ff,stroke:#7c3aed

  %% ACTORS
  user(Employee/User)
  fo(Finance Officer)
  pm(Product Manager)
  class user,fo,pm ext

  %% SYSTEMS
  FE["Frontend (CRA, React+TS)\nPort 3000"]:::fe
  BE["Backend (Spring Boot)\nPort 8080\nREST API under /api"]:::be
  DB[("MongoDB Atlas\nProject data collections")]:::db

  %% FLOWS
  user -- Uses --> FE
  fo -- Uses --> FE
  pm -- Views KPIs & Reports --> FE

  FE -- HTTPS JSON --> BE
  BE -- CRUD via Spring Data --> DB

  %% Notes
  note1["CORS: allow http://localhost:3000 <-> http://localhost:8080\nSecurity: basic request validation + logging\nObservability: application logs"]
  note1 -.-> BE
```

## Notes for PMs
- The frontend communicates with the backend at `http://localhost:8080/api`.
- CORS is enabled for `localhost:3000` and `localhost:8080` in `ProjecrSubmission/CorsConfig.java`.
- MongoDB Atlas stores all core entities (Employees, Projects, Submissions, Receipts, Expenditures, Funding Agencies, PFMS, Bank details).
