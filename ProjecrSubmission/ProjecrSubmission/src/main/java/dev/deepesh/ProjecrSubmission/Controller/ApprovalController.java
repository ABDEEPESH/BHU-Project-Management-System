package dev.deepesh.ProjecrSubmission.Controller;

import dev.deepesh.ProjecrSubmission.Security.service.DualAdminApprovalService;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/approvals/forms")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
public class ApprovalController {

    @Autowired
    private DualAdminApprovalService approvalService;

    // STAFF creates a pending request for a specific form
    @PostMapping("/request")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "202", description = "Approval request created")
    })
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<?> requestFormApproval(
            Authentication auth,
            @RequestParam("form") String formName
    ) {
        try {
            if (auth == null || auth.getName() == null || auth.getName().isBlank()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                        "error", "Unauthenticated"
                ));
            }
            if (formName == null || formName.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Missing form parameter"
                ));
            }
            String username = auth.getName();
            String op = "FORM_APPROVAL:" + formName.toUpperCase();
            String approvalId = approvalService.createApprovalRequest(op, username);
            return ResponseEntity.accepted().body(Map.of(
                    "message", "Approval request created",
                    "approvalId", approvalId,
                    "user", username,
                    "form", formName.toUpperCase()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "error", e.getMessage() != null ? e.getMessage() : "Failed to create approval request",
                    "form", String.valueOf(formName)
            ));
        }
    }

    // ADMIN approves a specific staff+form (single admin approval sufficient)
    @PostMapping("/enable")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Form approved for staff"),
            @ApiResponse(responseCode = "202", description = "Approval recorded")
    })
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> enableFormForStaff(
            @RequestParam("username") String username,
            @RequestParam("form") String formName
    ) {
        String op = "FORM_APPROVAL:" + formName.toUpperCase();
        String approvalId = approvalService.requestSingleApproval(op, username);
        if (approvalId == null) {
            return ResponseEntity.ok(Map.of(
                    "message", "Form approved",
                    "user", username,
                    "form", formName.toUpperCase()
            ));
        }
        return ResponseEntity.accepted().body(Map.of(
                "message", "Approval recorded",
                "approvalId", approvalId,
                "user", username,
                "form", formName.toUpperCase()
        ));
    }

    // Any authenticated user can check their status for a form
    @GetMapping("/status")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Approval status returned")
    })
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getFormApprovalStatus(Authentication auth, @RequestParam("form") String formName) {
        String username = auth.getName();
        String op = "FORM_APPROVAL:" + formName.toUpperCase();
        boolean approved = approvalService.hasSingleApproval(op, username);
        boolean rejected = approvalService.isSingleRejected(op, username);
        return ResponseEntity.ok(Map.of(
                "user", username,
                "form", formName.toUpperCase(),
                "approved", approved,
                "rejected", rejected
        ));
    }

    // SSE stream for approval updates (tries for ~120 seconds)
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @PreAuthorize("isAuthenticated()")
    public SseEmitter streamFormApproval(Authentication auth, @RequestParam("form") String formName) {

        final SseEmitter emitter = new SseEmitter(130_000L); // 130s timeout
        final String username = auth.getName();
        final String op = "FORM_APPROVAL:" + formName.toUpperCase();

        Runnable task = () -> {
            try {
                // Immediate status
                boolean approved = approvalService.hasSingleApproval(op, username);
                boolean rejected = approvalService.isSingleRejected(op, username);
                if (approved) {
                    emitter.send(SseEmitter.event().name("approved").data(Map.of(
                            "user", username,
                            "form", formName.toUpperCase(),
                            "approved", true
                    )));
                    emitter.complete();
                    return;
                }
                if (rejected) {
                    emitter.send(SseEmitter.event().name("rejected").data(Map.of(
                            "user", username,
                            "form", formName.toUpperCase(),
                            "approved", false,
                            "rejected", true
                    )));
                    emitter.complete();
                    return;
                }
                long start = System.currentTimeMillis();
                while (System.currentTimeMillis() - start < 120_000L) { // 120s
                    try { Thread.sleep(2000L); } catch (InterruptedException ignored) { }
                    boolean nowApproved = approvalService.hasSingleApproval(op, username);
                    boolean nowRejected = approvalService.isSingleRejected(op, username);
                    if (nowApproved) {
                        emitter.send(SseEmitter.event().name("approved").data(Map.of(
                                "user", username,
                                "form", formName.toUpperCase(),
                                "approved", true
                        )));));
                        emitter.complete();
                        return;
                    }
                    if (nowRejected) {
                        emitter.send(SseEmitter.event().name("rejected").data(Map.of(
                                "user", username,
                                "form", formName.toUpperCase(),
                                "approved", false,
                                "rejected", true
                        )));
                        emitter.complete();
                        return;
                    }
                    // heartbeat to keep connection
                    emitter.send(SseEmitter.event().name("ping").data("."));
                }
                // timeout without approval
                emitter.send(SseEmitter.event().name("timeout").data(Map.of(
                        "user", username,
                        "form", formName.toUpperCase(),
                        "approved", false
                )));
                emitter.complete();
            } catch (Exception ex) {
                try { emitter.completeWithError(ex); } catch (Exception ignored) {}
            }
        };

        new Thread(task, "sse-approval-" + username + "-" + formName).start();
        return emitter;
    }

    // Admin: list pending approval requests (includes staff form requests)
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> listPendingApprovals() {
        List<DualAdminApprovalService.PendingApprovalView> list = approvalService.listPendingApprovals();
        return ResponseEntity.ok(list);
    }

    // Admin: decide on a pending approval (approve=true to accept, false to reject)
    @PostMapping("/decide")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> decideApproval(@RequestParam("id") String approvalId,
                                            @RequestParam("approve") boolean approve) {
        try {
            approvalService.adminDecide(approvalId, approve);
            return ResponseEntity.ok(Map.of("message", approve ? "Approved" : "Rejected", "id", approvalId));
        } catch (SecurityException se) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", se.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage(), "id", approvalId));
        }
    }
}
