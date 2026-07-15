package dev.deepesh.ProjecrSubmission.Security.service;

import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Set;
import java.util.HashSet;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentMap;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
public class DualAdminApprovalService {
    
    // Store pending approvals with expiration
    private final ConcurrentHashMap<String, PendingApproval> pendingApprovals = new ConcurrentHashMap<>();
    // Store final single-approval decisions (approved/rejected) per approvalId
    private final ConcurrentMap<String, Boolean> singleApproved = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, Boolean> singleRejected = new ConcurrentHashMap<>();
    
    private static class PendingApproval {
        private final Set<String> approvedBy = new HashSet<>();
        private final LocalDateTime createdAt = LocalDateTime.now();
        private final String operationType;
        private final String requestData;
        
        public PendingApproval(String operationType, String requestData) {
            this.operationType = operationType;
            this.requestData = requestData;
        }
        
        public Set<String> getApprovedBy() { return approvedBy; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public String getRequestData() { return requestData; }
        public String getOperationType() { return operationType; }
        
        public boolean isExpired() {
            return ChronoUnit.HOURS.between(createdAt, LocalDateTime.now()) > 24;
        }
    }
    
    /**
     * Check if current user is an admin (only ADMIN role, not STAFF)
     */
    public boolean isCurrentUserAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        
        return auth.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
    }
    
    /**
     * Get current admin username (only ADMIN role)
     */
    public String getCurrentAdminUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return null;
        
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
        
        return isAdmin ? auth.getName() : null;
    }
    
    /**
     * Request approval for a create/add operation (dual admin)
     * Returns approval ID if this is the first approval, null if operation is approved
     */
    public String requestApproval(String operationType, String entityData) {
        String currentAdmin = getCurrentAdminUsername();
        if (currentAdmin == null) {
            throw new SecurityException("Only admins can request approvals");
        }
        
        String approvalId = generateApprovalId(operationType, entityData);
        
        // Clean expired approvals
        cleanExpiredApprovals();
        
        PendingApproval approval = pendingApprovals.computeIfAbsent(approvalId, 
            k -> new PendingApproval(operationType, entityData));
        
        approval.getApprovedBy().add(currentAdmin);
        
        // If we have 2 different admin approvals, operation is approved
        if (approval.getApprovedBy().size() >= 2) {
            pendingApprovals.remove(approvalId);
            return null; // Operation approved
        }
        
        return approvalId; // Need more approvals
    }
    
    /**
     * Check if an operation has dual admin approval
     */
    public boolean hasDualApproval(String operationType, String entityData) {
        String approvalId = generateApprovalId(operationType, entityData);
        PendingApproval approval = pendingApprovals.get(approvalId);
        
        if (approval == null || approval.isExpired()) {
            return false;
        }
        
        return approval.getApprovedBy().size() >= 2;
    }

    /**
     * Single admin approval variant for flows where only one admin sign-off is required
     */
    public boolean hasSingleApproval(String operationType, String entityData) {
        String approvalId = generateApprovalId(operationType, entityData);
        // If a final decision exists, trust it
        if (Boolean.TRUE.equals(singleApproved.get(approvalId))) {
            return true;
        }
        // fall back to pending entry having at least one admin
        PendingApproval approval = pendingApprovals.get(approvalId);
        if (approval == null || approval.isExpired()) {
            return false;
        }
        return approval.getApprovedBy().size() >= 1;
    }

    public boolean isSingleRejected(String operationType, String entityData) {
        String approvalId = generateApprovalId(operationType, entityData);
        return Boolean.TRUE.equals(singleRejected.get(approvalId));
    }

    /**
     * Request single admin approval. Returns null if already approved by at least one admin,
     * otherwise returns an approvalId that an admin can use to approve.
     */
    public String requestSingleApproval(String operationType, String entityData) {
        String currentAdmin = getCurrentAdminUsername();
        if (currentAdmin == null) {
            throw new SecurityException("Only admins can request approvals");
        }
        String approvalId = generateApprovalId(operationType, entityData);
        cleanExpiredApprovals();
        PendingApproval approval = pendingApprovals.computeIfAbsent(approvalId, k -> new PendingApproval(operationType, entityData));
        approval.getApprovedBy().add(currentAdmin);
        // Mark as finally approved and remove from pending
        singleApproved.put(approvalId, true);
        singleRejected.remove(approvalId);
        pendingApprovals.remove(approvalId);
        return null;
    }
    
    /**
     * Get pending approval status
     */
    public PendingApprovalStatus getPendingApprovalStatus(String approvalId) {
        PendingApproval approval = pendingApprovals.get(approvalId);
        if (approval == null) {
            return new PendingApprovalStatus(false, 0, null);
        }
        
        if (approval.isExpired()) {
            pendingApprovals.remove(approvalId);
            return new PendingApprovalStatus(false, 0, null);
        }
        
        return new PendingApprovalStatus(true, approval.getApprovedBy().size(), 
            approval.getApprovedBy());
    }
    
    private String generateApprovalId(String operationType, String entityData) {
        return String.valueOf((operationType + entityData).hashCode());
    }
    
    private void cleanExpiredApprovals() {
        pendingApprovals.entrySet().removeIf(entry -> entry.getValue().isExpired());
    }
    
    /**
     * Create a pending approval request without adding any approver yet.
     * Intended for user/guest flows to request admin approval.
     * Returns the approvalId for tracking.
     */
    public String createApprovalRequest(String operationType, String entityData) {
        String approvalId = generateApprovalId(operationType, entityData);
        cleanExpiredApprovals();
        pendingApprovals.computeIfAbsent(approvalId, k -> new PendingApproval(operationType, entityData));
        return approvalId;
    }

    public static class PendingApprovalView {
        public final String id;
        public final String operationType;
        public final String requestData;
        public final int approvalCount;
        public final Set<String> approvedBy;
        public final LocalDateTime createdAt;
        public PendingApprovalView(String id, String operationType, String requestData, int approvalCount, Set<String> approvedBy, LocalDateTime createdAt) {
            this.id = id;
            this.operationType = operationType;
            this.requestData = requestData;
            this.approvalCount = approvalCount;
            this.approvedBy = approvedBy != null ? new HashSet<>(approvedBy) : new HashSet<>();
            this.createdAt = createdAt;
        }
    }

    public List<PendingApprovalView> listPendingApprovals() {
        cleanExpiredApprovals();
        List<PendingApprovalView> list = new ArrayList<>();
        for (Map.Entry<String, PendingApproval> e : pendingApprovals.entrySet()) {
            PendingApproval p = e.getValue();
            if (p != null && !p.isExpired()) {
                list.add(new PendingApprovalView(
                        e.getKey(),
                        p.getOperationType(),
                        p.getRequestData(),
                        p.getApprovedBy().size(),
                        p.getApprovedBy(),
                        p.getCreatedAt()
                ));
            }
        }
        return list;
    }

    public void adminDecide(String approvalId, boolean approve) {
        String currentAdmin = getCurrentAdminUsername();
        if (currentAdmin == null) {
            throw new SecurityException("Only admins can decide approvals");
        }
        PendingApproval p = pendingApprovals.get(approvalId);
        if (p == null) {
            // If already finalized, ignore
            if (approve) singleApproved.put(approvalId, true);
            else singleRejected.put(approvalId, true);
            return;
        }
        if (!approve) {
            // Reject and clear pending
            singleRejected.put(approvalId, true);
            singleApproved.remove(approvalId);
            pendingApprovals.remove(approvalId);
            return;
        }
        // Approve
        p.getApprovedBy().add(currentAdmin);
        // Single approval flows: any op starting with FORM_APPROVAL:
        boolean isSingle = p.getOperationType() != null && p.getOperationType().startsWith("FORM_APPROVAL:");
        if (isSingle || p.getApprovedBy().size() >= 2) {
            singleApproved.put(approvalId, true);
            singleRejected.remove(approvalId);
            pendingApprovals.remove(approvalId);
        }
    }

    public static class PendingApprovalStatus {
        private final boolean exists;
        private final int approvalCount;
        private final Set<String> approvedBy;
        
        public PendingApprovalStatus(boolean exists, int approvalCount, Set<String> approvedBy) {
            this.exists = exists;
            this.approvalCount = approvalCount;
            this.approvedBy = approvedBy != null ? new HashSet<>(approvedBy) : new HashSet<>();
        }
        
        public boolean exists() { return exists; }
        public int getApprovalCount() { return approvalCount; }
        public Set<String> getApprovedBy() { return approvedBy; }
        public boolean needsMoreApprovals() { return exists && approvalCount < 2; }
    }
}