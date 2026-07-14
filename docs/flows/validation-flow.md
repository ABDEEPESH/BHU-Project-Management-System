<!-- Logo -->
<p align="center">
  <img src="../../employee-project-frontend-cra/public/bhu-logo-header.png" alt="BHU Logo" height="90" />
</p>

# Validation & Error Handling Flow

References
- Global handler: `.../exception/GlobalExceptionHandler.java`
- Error DTO: `.../exception/ApiError.java`

```mermaid
sequenceDiagram
  autonumber
  actor U as User
  participant FE as Frontend
  participant API as Controller
  participant VAL as Bean Validation (@Valid)
  participant EH as GlobalExceptionHandler

  U->>FE: Submit form
  FE->>API: POST /... { body }
  API->>VAL: @Valid on @RequestBody
  alt validation passes
    API-->>FE: 201/200 entity
  else validation fails
    VAL->>EH: MethodArgumentNotValidException
    EH-->>FE: 400 ApiError { validations: [ {field, message}, ... ] }
  end

  Note over API,EH: Not Found
  API->>EH: throw ResourceNotFoundException("...not found...")
  EH-->>FE: 404 ApiError

  Note over API,EH: Bad Input
  API->>EH: throw IllegalArgumentException("reason")
  EH-->>FE: 400 ApiError

  Note over API,EH: Access Denied
  API->>EH: AccessDeniedException
  EH-->>FE: 403 ApiError

  Note over API,EH: Unhandled Errors
  API->>EH: Exception
  EH-->>FE: 500 ApiError
```

ApiError Structure
- timestamp: ISO time
- status: HTTP status code
- error: short status text
- message: human-readable message
- path: request URI
- validations: optional array of `{ field, message }` when validation fails
