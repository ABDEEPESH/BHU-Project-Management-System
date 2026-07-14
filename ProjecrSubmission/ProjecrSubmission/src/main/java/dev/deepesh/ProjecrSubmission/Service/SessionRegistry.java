package dev.deepesh.ProjecrSubmission.Service;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SessionRegistry {

    public static class SessionInfo {
        public final String id;
        public final String identity; // key (username or staff eid)
        public final String role;     // admin | user | viewer
        public final String username; // may be same as identity
        public final String eid;      // for staff
        public final long startedAt;
        public volatile long lastSeenAt;

        public SessionInfo(String identity, String role, String username, String eid) {
            this.id = UUID.randomUUID().toString();
            this.identity = identity;
            this.role = role;
            this.username = username;
            this.eid = eid;
            long now = Instant.now().toEpochMilli();
            this.startedAt = now;
            this.lastSeenAt = now;
        }
    }

    private final Map<String, SessionInfo> sessionsByIdentity = new ConcurrentHashMap<>();

    public void upsertHeartbeat(String role, String username, String eid) {
        String identity = (username != null && !username.isBlank()) ? username : (eid != null ? eid : null);
        if (identity == null || identity.isBlank()) return;
        sessionsByIdentity.compute(identity, (k, existing) -> {
            if (existing == null) {
                return new SessionInfo(identity, role, username, eid);
            } else {
                existing.lastSeenAt = Instant.now().toEpochMilli();
                return existing;
            }
        });
    }

    public boolean hasActive(String identity, long windowMs) {
        if (identity == null || identity.isBlank()) return false;
        SessionInfo s = sessionsByIdentity.get(identity);
        if (s == null) return false;
        long now = Instant.now().toEpochMilli();
        return (now - s.lastSeenAt) <= windowMs;
    }

    public List<SessionInfo> listActive(long expiryMs) {
        long now = Instant.now().toEpochMilli();
        sessionsByIdentity.values().removeIf(s -> (now - s.lastSeenAt) > expiryMs);
        return new ArrayList<>(sessionsByIdentity.values());
    }

    public void clear(String identity) {
        if (identity == null) return;
        sessionsByIdentity.remove(identity);
    }
}