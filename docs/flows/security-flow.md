<!-- Logo -->
<p align="center">
  <img src="../../employee-project-frontend-cra/public/bhu-logo-header.png" alt="BHU Logo" height="90" />
</p>

# Security Flow – JWT Auth and RBAC

References
- Config: `.../Security/SecurityConfig.java`
- JWT: `.../Security/jwt/JwtAuthFilter.java`, `.../Security/jwt/JwtUtil.java`
- Users: `.../Security/model/UserAccount.java`, `.../Security/repo/UserAccountRepository.java`
- Auth: `.../Security/controller/AuthController.java`

```mermaid
sequenceDiagram
  autonumber
  actor U as User
  participant FE as Frontend
  participant AUTH as AuthController
  participant SEC as Spring Security
  participant JWT as JwtAuthFilter
  participant UDS as UserDetailsService

  U->>FE: Submit credentials
  FE->>AUTH: POST /api/auth/login {username,password}
  AUTH->>SEC: AuthenticationManager.authenticate
  SEC->>UDS: loadUserByUsername
  UDS-->>SEC: UserDetails (roles)
  alt success
    AUTH->>AUTH: JwtUtil.generateToken(user, roles)
    AUTH-->>FE: 200 { token }
  else failure
    AUTH-->>FE: 400 ApiError("Invalid credentials")
  end

  FE->>SEC: Any protected request with Authorization: Bearer token
  SEC->>JWT: JwtAuthFilter extracts token
  JWT->>JWT: validate + set SecurityContext
  alt invalid/expired
    SEC-->>FE: 401/403 ApiError
  else ok
    SEC-->>FE: Continue to controller
  end
```

RBAC
- Mutating endpoints use `@PreAuthorize("hasAnyRole('ADMIN','FORM')")`.
- Deletes use `@PreAuthorize("hasRole('ADMIN')")`.
- All routes except `/api/auth/**`, `/api/health/**`, docs and OPTIONS are authenticated (see `SecurityConfig`).

Headers & Hardening
- HSTS, CSP, Frame-Options, Referrer-Policy, X-Content-Type-Options configured in `SecurityConfig`.
- BCrypt(12) for password hashing.
- JWT secret must be >=256-bit. Fallback derivation via SHA-256 safeguards weak secrets.
