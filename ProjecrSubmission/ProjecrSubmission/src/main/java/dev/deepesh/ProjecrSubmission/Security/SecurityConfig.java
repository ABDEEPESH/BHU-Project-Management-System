package dev.deepesh.ProjecrSubmission.Security;

import dev.deepesh.ProjecrSubmission.Security.jwt.JwtAuthFilter;
import dev.deepesh.ProjecrSubmission.Security.model.UserAccount;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;
import java.util.Set;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .headers(headers -> headers
                .contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'self'; object-src 'none'; frame-ancestors 'none'"))
                .referrerPolicy(rp -> rp.policy(org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy.SAME_ORIGIN))
                .frameOptions(fo -> fo.deny())
                .httpStrictTransportSecurity(hsts -> hsts
                    .includeSubDomains(true)
                    .preload(true)
                    .maxAgeInSeconds(31536000)
                )
                .contentTypeOptions(org.springframework.security.config.Customizer.withDefaults())
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers(
                        "/api/auth/**",
                        "/api/health/**",
                        "/v3/api-docs/**",
                        "/swagger-ui/**",
                        "/swagger-ui.html"
                ).permitAll()
                // Allow guest user heartbeat and permission request creation
                .requestMatchers(HttpMethod.POST,
                        "/api/monitor/heartbeat",
                        "/api/approvals/requests"
                ).permitAll()
                // Public READ-ONLY endpoints for guest browsing
                .requestMatchers(HttpMethod.GET,
                        "/api/funding-agencies/**",
                        "/api/project-received/**",
                        "/api/project-submission/**",
                        "/api/employee/**",
                        "/api/fund-receipt/**",
                        "/api/fund-expenditure/**",
                        "/api/equipment/**",
                        "/api/project/**"
                ).permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(Arrays.asList(
                "http://localhost:3000",
                "http://localhost:3001",
                "http://127.0.0.1:3000",
                "http://127.0.0.1:3001",
                "http://localhost:8080"
        ));
        cfg.setAllowedMethods(Arrays.asList("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
        cfg.setAllowedHeaders(Arrays.asList("Authorization","Content-Type","Accept","Origin","X-Requested-With"));
        cfg.setExposedHeaders(List.of("Authorization","Content-Type"));
        cfg.setAllowCredentials(true);
        cfg.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    // Ensure admin users exist; upsert admin1/admin2 if missing
    @Bean
    public CommandLineRunner seedAdmins(ApplicationContext ctx, PasswordEncoder encoder) {
        return args -> {
            try {
                Object repoBean;
                try {
                    // Resolve by conventional bean name to avoid hard type reference
                    repoBean = ctx.getBean("userAccountRepository");
                } catch (Exception e) {
                    System.err.println("[SEED] UserAccountRepository bean not found; skipping admin seeding.");
                    return;
                }

                upsertAdminReflect(repoBean, encoder, "admin1", "Admin1@123");
                upsertAdminReflect(repoBean, encoder, "admin2", "Admin2@123");
                
                // Create 100 staff users
                for (int i = 1; i <= 100; i++) {
                    String staffUsername = String.format("staff%03d", i);
                    String staffPassword = String.format("Staff%03d@123", i);
                    upsertStaffReflect(repoBean, encoder, staffUsername, staffPassword);
                }
            } catch (Exception e) {
                System.err.println("[SEED] Failed to seed admin users: " + e.getMessage());
            }
        };
    }

    private void upsertAdminReflect(Object userRepo, PasswordEncoder encoder, String username, String rawPassword) throws Exception {
        java.lang.reflect.Method findByUsername = userRepo.getClass().getMethod("findByUsername", String.class);
        java.lang.reflect.Method save = userRepo.getClass().getMethod("save", Object.class);

        @SuppressWarnings("unchecked")
        java.util.Optional<?> existingOpt = (java.util.Optional<?>) findByUsername.invoke(userRepo, username);
        if (existingOpt.isPresent()) {
            Object existing = existingOpt.get();
            existing.getClass().getMethod("setPasswordHash", String.class).invoke(existing, encoder.encode(rawPassword));
            existing.getClass().getMethod("setRoles", Set.class).invoke(existing, Set.of("ROLE_ADMIN", "ROLE_FORM"));
            save.invoke(userRepo, existing);
            System.out.println("[SEED] Admin user updated: username=" + username + ", password reset.");
        } else {
            UserAccount admin = new UserAccount();
            admin.setUsername(username);
            admin.setPasswordHash(encoder.encode(rawPassword));
            admin.setRoles(Set.of("ROLE_ADMIN", "ROLE_FORM"));
            save.invoke(userRepo, admin);
            System.out.println("[SEED] Created admin user: username=" + username + ", password=" + rawPassword);
        }
    }

    private void upsertStaffReflect(Object userRepo, PasswordEncoder encoder, String username, String rawPassword) throws Exception {
        java.lang.reflect.Method findByUsername = userRepo.getClass().getMethod("findByUsername", String.class);
        java.lang.reflect.Method save = userRepo.getClass().getMethod("save", Object.class);

        @SuppressWarnings("unchecked")
        java.util.Optional<?> existingOpt = (java.util.Optional<?>) findByUsername.invoke(userRepo, username);
        if (existingOpt.isPresent()) {
            Object existing = existingOpt.get();
            existing.getClass().getMethod("setPasswordHash", String.class).invoke(existing, encoder.encode(rawPassword));
            existing.getClass().getMethod("setRoles", Set.class).invoke(existing, Set.of("ROLE_STAFF", "ROLE_FORM"));
            save.invoke(userRepo, existing);
            System.out.println("[SEED] Staff user updated: username=" + username + ", password reset.");
        } else {
            UserAccount staff = new UserAccount();
            staff.setUsername(username);
            staff.setPasswordHash(encoder.encode(rawPassword));
            staff.setRoles(Set.of("ROLE_STAFF", "ROLE_FORM"));
            save.invoke(userRepo, staff);
            System.out.println("[SEED] Created staff user: username=" + username + ", password=" + rawPassword);
        }
    }
}