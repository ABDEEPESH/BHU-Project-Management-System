package dev.deepesh.ProjecrSubmission.Controller;

import dev.deepesh.ProjecrSubmission.Model.ProjectReceived;
import dev.deepesh.ProjecrSubmission.Service.EmployeeService;
import dev.deepesh.ProjecrSubmission.Service.ProjectReceivedService;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
@RestController
@RequestMapping("/api/project-received")
public class ProjectReceivedController {

    private static final Logger logger = LoggerFactory.getLogger(ProjectReceivedController.class);

    @Autowired
    private ProjectReceivedService projectReceivedService;

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private dev.deepesh.ProjecrSubmission.Security.service.DualAdminApprovalService dualAdminApprovalService;

    @GetMapping
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved projects"),
            @ApiResponse(responseCode = "500", description = "Server error")
    })
    public ResponseEntity<Map<String, Object>> getAllProjectReceived() {
        logger.info("Fetching all project received entries");
        try {
            List<ProjectReceived> projects = projectReceivedService.getAllProjectReceived();
            Map<String, Object> response = new HashMap<>();
            response.put("projects", projects);
            response.put("count", projects.size());
            if (projects.isEmpty()) {
                response.put("message", "No valid projects found. Some projects may have invalid data.");
            }
            logger.info("Found {} project received entries", projects.size());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.error("Error fetching all project received entries: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch projects: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/eid/{idNo}")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved projects"),
            @ApiResponse(responseCode = "404", description = "No projects found"),
            @ApiResponse(responseCode = "500", description = "Server error")
    })
    public ResponseEntity<?> getProjectReceivedByIdNo(@PathVariable String idNo) {
        logger.info("Fetching project received entries for employee ID: {}", idNo);
        try {
            List<ProjectReceived> projects = projectReceivedService.getProjectReceivedByIdNo(idNo);
            if (projects.isEmpty()) {
                logger.warn("No project received entries found for employee ID: {}", idNo);
                return ResponseEntity.status(404).body(Map.of("error", "No projects found for employee ID: " + idNo));
            }
            logger.info("Found {} project received entries for employee ID: {}", projects.size(), idNo);
            return ResponseEntity.ok(Map.of("projects", projects, "count", projects.size()));
        } catch (RuntimeException e) {
            logger.error("Error fetching project received entries for employee ID {}: {}", idNo, e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Server error: " + e.getMessage()));
        }
    }

    @GetMapping("/details/eid/{idNo}")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved project details with employee"),
            @ApiResponse(responseCode = "404", description = "No projects found"),
            @ApiResponse(responseCode = "500", description = "Server error")
    })
    public ResponseEntity<?> getProjectReceivedDetailsByIdNo(@PathVariable String idNo) {
        logger.info("Fetching project received details for employee ID: {}", idNo);
        try {
            List<ProjectReceived> projects = projectReceivedService.getProjectReceivedByIdNo(idNo);
            if (projects.isEmpty()) {
                logger.warn("No project received entries found for employee ID: {}", idNo);
                return ResponseEntity.status(404).body(Map.of("error", "No projects found for employee ID: " + idNo));
            }
            var employeeOpt = employeeService.findByIdNo(idNo);
            Map<String, Object> response = new HashMap<>();
            response.put("projects", projects);
            response.put("count", projects.size());
            response.put("employee", employeeOpt.orElse(null));
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.error("Error fetching project received details for employee ID {}: {}", idNo, e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Server error: " + e.getMessage()));
        }
    }

    @PostMapping("/create")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Project created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid project data"),
            @ApiResponse(responseCode = "500", description = "Server error")
    })
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<?> createProjectReceived(@Valid @RequestBody ProjectReceived projectReceived) {
        logger.info("Creating project received entry for employee ID: {}", projectReceived.getIdNo());
        try {
            // Gate STAFF by single admin approval; ADMIN bypasses
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            boolean isAdmin = dualAdminApprovalService.isCurrentUserAdmin();
            String currentUser = auth != null ? auth.getName() : null;
            if (!isAdmin) {
                String op = "FORM_APPROVAL:PROJECT_RECEIVED";
                if (!dualAdminApprovalService.hasSingleApproval(op, currentUser)) {
                    return ResponseEntity.status(403).body(Map.of(
                            "error", "Admin approval required to use Project Received create form",
                            "hint", "Ask an admin to approve via /api/approvals/forms/enable?username=" + currentUser + "&form=PROJECT_RECEIVED"
                    ));
                }
            }
            ProjectReceived savedProject = projectReceivedService.createProjectReceived(projectReceived);

            logger.info("Project received entry created successfully for employee ID: {}", savedProject.getIdNo());
            return ResponseEntity.status(201).body(savedProject);
        } catch (IllegalArgumentException e) {
            logger.error("Error creating project received entry: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Server error creating project received entry: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Server error: " + e.getMessage()));
        }
    }
}