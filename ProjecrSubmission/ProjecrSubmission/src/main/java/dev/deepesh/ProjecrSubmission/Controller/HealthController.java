package dev.deepesh.ProjecrSubmission.Controller;

import dev.deepesh.ProjecrSubmission.Repository.EmployeeRepository;
import dev.deepesh.ProjecrSubmission.Repository.ProjectRepository;
import dev.deepesh.ProjecrSubmission.Repository.FundingAgencyRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import io.swagger.v3.oas.annotations.Hidden;

@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
@RestController
@RequestMapping("/api/health")
public class HealthController {

    private static final Logger logger = LoggerFactory.getLogger(HealthController.class);

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private FundingAgencyRepository fundingAgencyRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        logger.info("Health check endpoint called");
        
        try {
            // Test MongoDB connection
            String dbName = mongoTemplate.getDb().getName();
            response.put("status", "UP");
            response.put("database", dbName);
            response.put("message", "Backend is running and connected to MongoDB");
            
            // Test repository connections
            Map<String, Object> repositories = new HashMap<>();
            
            try {
                long employeeCount = employeeRepository.count();
                repositories.put("employees", Map.of("status", "UP", "count", employeeCount));
                logger.info("Employee repository: {} records", employeeCount);
            } catch (Exception e) {
                repositories.put("employees", Map.of("status", "DOWN", "error", e.getMessage()));
                logger.error("Employee repository error: {}", e.getMessage());
            }
            
            try {
                long projectCount = projectRepository.count();
                repositories.put("projects", Map.of("status", "UP", "count", projectCount));
                logger.info("Project repository: {} records", projectCount);
            } catch (Exception e) {
                repositories.put("projects", Map.of("status", "DOWN", "error", e.getMessage()));
                logger.error("Project repository error: {}", e.getMessage());
            }
            
            try {
                long fundingAgencyCount = fundingAgencyRepository.count();
                repositories.put("fundingAgencies", Map.of("status", "UP", "count", fundingAgencyCount));
                logger.info("Funding agency repository: {} records", fundingAgencyCount);
            } catch (Exception e) {
                repositories.put("fundingAgencies", Map.of("status", "DOWN", "error", e.getMessage()));
                logger.error("Funding agency repository error: {}", e.getMessage());
            }
            
            response.put("repositories", repositories);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Health check failed: {}", e.getMessage(), e);
            response.put("status", "DOWN");
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/db-collections")
    public ResponseEntity<Map<String, Object>> checkCollections() {
        Map<String, Object> response = new HashMap<>();
        logger.info("Database collections check endpoint called");
        
        try {
            Set<String> collections = mongoTemplate.getCollectionNames();
            response.put("status", "UP");
            response.put("collections", collections);
            response.put("totalCollections", collections.size());
            
            logger.info("Found {} collections: {}", collections.size(), collections);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Collections check failed: {}", e.getMessage(), e);
            response.put("status", "DOWN");
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}

// ---------------------- Added lightweight Monitor API ----------------------
@Hidden
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
@RestController
@RequestMapping("/api/monitor")
class MonitorController {

    private static final SessionRegistry SESSION_REGISTRY = SessionRegistry.getInstance();

    @PostMapping("/heartbeat")
    public ResponseEntity<Map<String, Object>> heartbeat(@RequestBody Map<String, Object> payload) {
        try {
            String role = String.valueOf(payload.getOrDefault("role", "viewer"));
            String eid = payload.get("eid") != null ? String.valueOf(payload.get("eid")) : null;
            String username = payload.get("username") != null ? String.valueOf(payload.get("username")) : null;
            SESSION_REGISTRY.recordHeartbeat(role, eid, username);
            return ResponseEntity.ok(Map.of("status", "ok"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/sessions")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<java.util.List<ActiveSessionDTO>> sessions() {
        return ResponseEntity.ok(SESSION_REGISTRY.getActiveSessions());
    }

    // --- helpers ---
    static class ActiveSessionDTO {
        public String id;
        public String role; // admin | user | viewer
        public String eid;
        public String username;
        public String startedAt;
        public String lastSeenAt;
        public Long durationMs;
    }

    static class SessionRegistry {
        private static final SessionRegistry INSTANCE = new SessionRegistry();
        public static SessionRegistry getInstance() { return INSTANCE; }

        private final java.util.concurrent.ConcurrentHashMap<String, Session> sessions = new java.util.concurrent.ConcurrentHashMap<>();

        void recordHeartbeat(String role, String eid, String username) {
            long now = System.currentTimeMillis();
            String key = (username != null && !username.isBlank()) ? ("admin:" + username)
                    : (eid != null && !eid.isBlank() ? ("user:" + eid) : ("viewer:" + java.util.UUID.randomUUID()));
            sessions.compute(key, (k, existing) -> {
                if (existing == null) {
                    Session s = new Session();
                    s.id = k;
                    s.role = role;
                    s.eid = eid;
                    s.username = username;
                    s.startedAt = now;
                    s.lastSeenAt = now;
                    return s;
                } else {
                    existing.lastSeenAt = now;
                    existing.role = role;
                    existing.eid = eid != null ? eid : existing.eid;
                    existing.username = username != null ? username : existing.username;
                    return existing;
                }
            });
            // Cleanup stale (> 2 hours)
            long cutoff = now - (2 * 60 * 60 * 1000);
            sessions.values().removeIf(s -> s.lastSeenAt < cutoff);
        }

        java.util.List<ActiveSessionDTO> getActiveSessions() {
            long now = System.currentTimeMillis();
            java.util.List<ActiveSessionDTO> list = new java.util.ArrayList<>();
            for (Session s : sessions.values()) {
                ActiveSessionDTO dto = new ActiveSessionDTO();
                dto.id = s.id;
                dto.role = s.role;
                dto.eid = s.eid;
                dto.username = s.username;
                dto.startedAt = new java.util.Date(s.startedAt).toInstant().toString();
                dto.lastSeenAt = new java.util.Date(s.lastSeenAt).toInstant().toString();
                dto.durationMs = now - s.startedAt;
                list.add(dto);
            }
            list.sort(java.util.Comparator.comparing(a -> a.lastSeenAt));
            java.util.Collections.reverse(list);
            return list;
        }

        static class Session { String id; String role; String eid; String username; long startedAt; long lastSeenAt; }
    }
}

// ---------------------- Added lightweight Approvals API ----------------------
@Hidden
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
@RestController
@RequestMapping("/api/approvals")
class ApprovalsController {

    private static final ApprovalRegistry APPROVALS = ApprovalRegistry.getInstance();

    @PostMapping("/requests")
    public ResponseEntity<PermissionRequestDTO> create(@RequestBody PermissionRequestDTO req) {
        try {
            PermissionRequestDTO saved = APPROVALS.create(req);
            return ResponseEntity.status(201).body(saved);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(null);
        }
    }

    @GetMapping("/requests")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<java.util.List<PermissionRequestDTO>> list(@RequestParam(value = "status", required = false) String status) {
        return ResponseEntity.ok(APPROVALS.list(status));
    }

    @PostMapping("/requests/{id}/decision")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> decide(@PathVariable String id, @RequestBody Map<String, Object> body) {
        boolean approved = Boolean.TRUE.equals(body.get("approved"));
        PermissionRequestDTO updated = APPROVALS.decide(id, approved);
        if (updated == null) return ResponseEntity.status(404).body(Map.of("error", "Not found"));
        return ResponseEntity.ok(updated);
    }

    // --- helpers ---
    static class PermissionRequestDTO {
        public String _id;
        public String requesterRole; // user | admin
        public String requesterId;   // EID or username
        public String target;        // route or entity
        public String action;        // create | update | delete
        public String reason;
        public String status;        // pending | approved | rejected
        public String createdAt;
    }

    static class ApprovalRegistry {
        private static final ApprovalRegistry INSTANCE = new ApprovalRegistry();
        public static ApprovalRegistry getInstance() { return INSTANCE; }

        private final java.util.concurrent.ConcurrentHashMap<String, PermissionRequestDTO> store = new java.util.concurrent.ConcurrentHashMap<>();

        PermissionRequestDTO create(PermissionRequestDTO req) {
            PermissionRequestDTO dto = new PermissionRequestDTO();
            dto._id = java.util.UUID.randomUUID().toString();
            dto.requesterRole = safe(req.requesterRole, "user");
            dto.requesterId = safe(req.requesterId, null);
            dto.target = safe(req.target, "unknown");
            dto.action = safe(req.action, "create");
            dto.reason = safe(req.reason, null);
            dto.status = "pending";
            dto.createdAt = new java.util.Date().toInstant().toString();
            store.put(dto._id, dto);
            return dto;
        }

        java.util.List<PermissionRequestDTO> list(String status) {
            java.util.List<PermissionRequestDTO> all = new java.util.ArrayList<>(store.values());
            if (status != null && !status.isBlank()) {
                String s = status.trim().toLowerCase();
                all.removeIf(r -> r.status == null || !r.status.equalsIgnoreCase(s));
            }
            // sort latest first
            all.sort((a,b) -> String.valueOf(b.createdAt).compareTo(String.valueOf(a.createdAt)));
            return all;
        }

        PermissionRequestDTO decide(String id, boolean approved) {
            PermissionRequestDTO dto = store.get(id);
            if (dto == null) return null;
            dto.status = approved ? "approved" : "rejected";
            return dto;
        }

        private String safe(String v, String def) { return (v == null || v.isBlank()) ? def : v; }
    }
}
