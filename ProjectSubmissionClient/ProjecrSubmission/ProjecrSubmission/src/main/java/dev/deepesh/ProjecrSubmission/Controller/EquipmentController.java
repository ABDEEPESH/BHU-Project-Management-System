package dev.deepesh.ProjecrSubmission.Controller;

import dev.deepesh.ProjecrSubmission.Model.Equipment;
import dev.deepesh.ProjecrSubmission.Service.EquipmentService;
import dev.deepesh.ProjecrSubmission.Security.service.DualAdminApprovalService;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
@RestController
@RequestMapping("/api/equipment")
public class EquipmentController {

    private static final Logger logger = LoggerFactory.getLogger(EquipmentController.class);

    @Autowired
    private EquipmentService equipmentService;

    @Autowired
    private DualAdminApprovalService dualAdminApprovalService;

    @PostMapping("/create")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Equipment created successfully"),
            @ApiResponse(responseCode = "202", description = "Equipment creation pending second admin approval"),
            @ApiResponse(responseCode = "400", description = "Invalid equipment data"),
            @ApiResponse(responseCode = "403", description = "Insufficient permissions - admin access required"),
            @ApiResponse(responseCode = "500", description = "Server error")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<?> createEquipment(@Valid @RequestBody Equipment equipment, BindingResult bindingResult) {
        logger.info("Creating equipment with voucher number: {}", equipment.getVoucherNumber());
        
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(
                    bindingResult.getFieldErrors().stream()
                            .map(error -> error.getField() + ": " + error.getDefaultMessage())
                            .collect(Collectors.joining(", "))
            );
        }

        try {
            // Gate STAFF by single admin approval for this form; ADMIN bypasses
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            boolean isAdmin = dualAdminApprovalService.isCurrentUserAdmin();
            String currentUser = auth != null ? auth.getName() : null;
            if (!isAdmin) {
                String op = "FORM_APPROVAL:EQUIPMENT";
                boolean allowed = dualAdminApprovalService.hasSingleApproval(op, currentUser);
                if (!allowed) {
                    return ResponseEntity.status(403).body(Map.of(
                            "error", "Admin approval required to use equipment create form",
                            "hint", "Ask an admin to approve via /api/approvals/forms/enable?username=" + currentUser + "&form=EQUIPMENT"
                    ));
                }
            }
            
            // Check for dual admin approval
            String entityData = equipment.getVoucherNumber() + ":" + equipment.getEquipmentName();
            String approvalId = dualAdminApprovalService.requestApproval("CREATE_EQUIPMENT", entityData);
            
            if (approvalId != null) {
                // Need second admin approval
                logger.info("Equipment creation requires second admin approval. Approval ID: {}", approvalId);
                return ResponseEntity.status(202).body(Map.of(
                    "message", "Equipment creation pending second admin approval",
                    "approvalId", approvalId,
                    "currentApprovals", dualAdminApprovalService.getPendingApprovalStatus(approvalId).getApprovalCount(),
                    "requiredApprovals", 2
                ));
            }
            
            // Dual approval granted, proceed with creation
            Equipment savedEquipment = equipmentService.save(equipment, bindingResult);
            logger.info("Equipment created successfully with voucher number: {}", savedEquipment.getVoucherNumber());
            return ResponseEntity.status(201).body(savedEquipment);
            
        } catch (SecurityException e) {
            logger.error("Security error creating equipment: {}", e.getMessage());
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            logger.error("Error creating equipment: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Server error creating equipment: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Server error: " + e.getMessage()));
        }
    }

    @GetMapping("/voucher/{voucherNumber}")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved equipment"),
            @ApiResponse(responseCode = "404", description = "Equipment not found"),
            @ApiResponse(responseCode = "500", description = "Server error")
    })
    public ResponseEntity<?> getEquipmentByVoucherNumber(@PathVariable String voucherNumber) {
        logger.info("Fetching equipment with voucher number: {}", voucherNumber);
        try {
            Optional<Equipment> equipment = equipmentService.findByVoucherNumber(voucherNumber);
            if (equipment.isPresent()) {
                logger.info("Equipment found with voucher number: {}", voucherNumber);
                return ResponseEntity.ok(equipment.get());
            } else {
                logger.warn("Equipment not found with voucher number: {}", voucherNumber);
                return ResponseEntity.status(404).body(Map.of("error", "Equipment not found with voucher number: " + voucherNumber));
            }
        } catch (Exception e) {
            logger.error("Error fetching equipment with voucher number {}: {}", voucherNumber, e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Server error: " + e.getMessage()));
        }
    }

    @GetMapping("/project/{projectNumber}")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved equipment"),
            @ApiResponse(responseCode = "404", description = "No equipment found"),
            @ApiResponse(responseCode = "500", description = "Server error")
    })
    public ResponseEntity<?> getEquipmentByProjectNumber(@PathVariable String projectNumber) {
        logger.info("Fetching equipment for project: {}", projectNumber);
        try {
            List<Equipment> equipment = equipmentService.findByProjectNumber(projectNumber);
            if (equipment.isEmpty()) {
                logger.warn("No equipment found for project: {}", projectNumber);
                return ResponseEntity.status(404).body(Map.of("error", "No equipment found for project: " + projectNumber));
            }
            logger.info("Found {} equipment records for project: {}", equipment.size(), projectNumber);
            return ResponseEntity.ok(Map.of("equipment", equipment, "count", equipment.size()));
        } catch (Exception e) {
            logger.error("Error fetching equipment for project {}: {}", projectNumber, e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Server error: " + e.getMessage()));
        }
    }

    @GetMapping
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved equipment"),
            @ApiResponse(responseCode = "500", description = "Server error")
    })
    public ResponseEntity<?> getAllEquipment() {
        logger.info("Fetching all equipment");
        try {
            List<Equipment> equipment = equipmentService.findAll();
            logger.info("Found {} equipment records", equipment.size());
            return ResponseEntity.ok(Map.of("equipment", equipment, "count", equipment.size()));
        } catch (Exception e) {
            logger.error("Error fetching all equipment: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Server error: " + e.getMessage()));
        }
    }

    @GetMapping("/approval/{approvalId}")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved approval status"),
            @ApiResponse(responseCode = "404", description = "Approval not found")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getApprovalStatus(@PathVariable String approvalId) {
        logger.info("Fetching approval status for ID: {}", approvalId);
        try {
            DualAdminApprovalService.PendingApprovalStatus status = dualAdminApprovalService.getPendingApprovalStatus(approvalId);
            if (!status.exists()) {
                return ResponseEntity.status(404).body(Map.of("error", "Approval not found or expired"));
            }
            
            return ResponseEntity.ok(Map.of(
                "approvalId", approvalId,
                "currentApprovals", status.getApprovalCount(),
                "requiredApprovals", 2,
                "approvedBy", status.getApprovedBy(),
                "needsMoreApprovals", status.needsMoreApprovals()
            ));
        } catch (Exception e) {
            logger.error("Error fetching approval status: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Server error: " + e.getMessage()));
        }
    }
}