package dev.deepesh.ProjecrSubmission.Security.service;

import dev.deepesh.ProjecrSubmission.Security.jwt.JwtUtil;
import dev.deepesh.ProjecrSubmission.Security.model.UserAccount;
import dev.deepesh.ProjecrSubmission.Security.repo.UserAccountRepository;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AccountService {

    private final UserAccountRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;

    public AccountService(UserAccountRepository userRepo, PasswordEncoder encoder, JwtUtil jwtUtil) {
        this.userRepo = userRepo;
        this.encoder = encoder;
        this.jwtUtil = jwtUtil;
    }

    public UserAccount registerUser(String username, String rawPassword, Set<String> roles) {
        if (userRepo.existsByUsername(username)) {
            throw new IllegalArgumentException("Username already exists");
        }
        UserAccount ua = new UserAccount();
        ua.setUsername(username);
        ua.setPasswordHash(encoder.encode(rawPassword));
        ua.setRoles(roles);
        return userRepo.save(ua);
    }

    public String login(String username, String password) {
        // Manually authenticate to avoid misconfigured AuthenticationManager
        UserAccount ua = userRepo.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
        if (!encoder.matches(password, ua.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        List<GrantedAuthority> authorities = ua.getRoles().stream()
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(username, null, authorities);
        SecurityContextHolder.getContext().setAuthentication(auth);

        String[] rolesArr = ua.getRoles().toArray(new String[0]);
        Map<String, Object> claims = new HashMap<>();
        return jwtUtil.generateToken(username, rolesArr, claims);
    }

    public UserAccount grantFormRole(String username) {
        UserAccount ua = userRepo.findByUsername(username).orElseThrow(() -> new IllegalArgumentException("User not found"));
        ua.getRoles().add("ROLE_FORM");
        return userRepo.save(ua);
    }

    public UserAccount grantAdminRole(String username) {
        UserAccount ua = userRepo.findByUsername(username).orElseThrow(() -> new IllegalArgumentException("User not found"));
        ua.getRoles().add("ROLE_ADMIN");
        return userRepo.save(ua);
    }

    public UserAccount grantStaffRole(String username) {
        UserAccount ua = userRepo.findByUsername(username).orElseThrow(() -> new IllegalArgumentException("User not found"));
        ua.getRoles().add("ROLE_STAFF");
        return userRepo.save(ua);
    }
}
