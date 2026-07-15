package dev.deepesh.ProjecrSubmission.Security.controller;

import dev.deepesh.ProjecrSubmission.Security.model.UserAccount;
import dev.deepesh.ProjecrSubmission.Security.service.AccountService;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import dev.deepesh.ProjecrSubmission.Service.SessionRegistry;
import org.springframework.http.HttpStatus;

import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
public class AuthController {

    private final AccountService accountService;
    private final SessionRegistry sessionRegistry;

    public AuthController(AccountService accountService, SessionRegistry sessionRegistry) {
        this.accountService = accountService;
        this.sessionRegistry = sessionRegistry;
    }

    public record RegisterRequest(@NotBlank String username, @NotBlank String password) {}
    public record LoginRequest(@NotBlank String username, @NotBlank String password) {}
    public record GrantRoleRequest(@NotBlank String username) {}

    @PostMapping("/register")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserAccount> register(@RequestBody RegisterRequest req) {
        UserAccount ua = accountService.registerUser(req.username(), req.password(), Set.of("ROLE_FORM"));
        return ResponseEntity.status(201).body(ua);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest req) {
        String identity = req.username();
        long WINDOW_MS = 5 * 60 * 1000L; // 5 minutes single-device window
        if (sessionRegistry.hasActive(identity, WINDOW_MS)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Already logged in on another device"));
        }
        String token = accountService.login(req.username(), req.password());
        // Seed session immediately; role will be refined by heartbeats from the client
        sessionRegistry.upsertHeartbeat("user", identity, identity);
        return ResponseEntity.ok(Map.of("token", token));
    }

    @PostMapping("/grant/form")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserAccount> grantForm(@RequestBody GrantRoleRequest req) {
        return ResponseEntity.ok(accountService.grantFormRole(req.username()));
    }

    @PostMapping("/grant/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserAccount> grantAdmin(@RequestBody GrantRoleRequest req) {
        return ResponseEntity.ok(accountService.grantAdminRole(req.username()));
    }

    @PostMapping("/grant/staff")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<UserAccount> grantStaff(@RequestBody GrantRoleRequest req) {
        return ResponseEntity.ok(accountService.grantStaffRole(req.username()));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> me(Authentication auth) {
        @SuppressWarnings("unchecked")
        Set<String> roles = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());
        return ResponseEntity.ok(Map.of(
                "username", auth.getName(),
                "roles", roles
        ));
    }
}
