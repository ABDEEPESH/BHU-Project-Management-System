package dev.deepesh.ProjecrSubmission.Controller;

import dev.deepesh.ProjecrSubmission.Service.SessionRegistry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/monitor")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
public class MonitorController {

    @Autowired
    private SessionRegistry sessionRegistry;

    public record HeartbeatRequest(String role, String username, String eid) {}

    // Identity is sent by the frontend for both admin and staff.
    @PostMapping("/heartbeat")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> heartbeat(@RequestBody HeartbeatRequest hb) {
        String role = (hb.role() == null) ? "user" : hb.role();
        sessionRegistry.upsertHeartbeat(role, hb.username(), hb.eid());
        return ResponseEntity.ok(Map.of("ok", true));
    }

    // Returns all non-expired sessions with identity fields
    @GetMapping("/sessions")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> sessions() {
        long EXPIRY_MS = 10 * 60 * 1000L; // 10 minutes expiry window server-side
        List<SessionRegistry.SessionInfo> list = sessionRegistry.listActive(EXPIRY_MS);
        long now = Instant.now().toEpochMilli();
        return ResponseEntity.ok(
            list.stream().map(s -> Map.of(
                "id", s.id,
                "role", s.role,
                "username", s.username,
                "eid", s.eid,
                "startedAt", s.startedAt,
                "lastSeenAt", s.lastSeenAt,
                "durationMs", Math.max(0, now - s.startedAt)
            ))
            .toList()
        );
    }
}