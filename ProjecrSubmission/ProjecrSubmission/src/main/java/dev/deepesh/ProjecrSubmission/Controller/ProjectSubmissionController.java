package dev.deepesh.ProjecrSubmission.Controller;

import dev.deepesh.ProjecrSubmission.Model.ProjectSubmission;
import dev.deepesh.ProjecrSubmission.Service.ProjectSubmissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
@RestController
@RequestMapping("/api/project-submission")
public class ProjectSubmissionController {

    private static final Logger logger = LoggerFactory.getLogger(ProjectSubmissionController.class);

    @Autowired
    private ProjectSubmissionService projectSubmissionService;

    @Autowired
    private dev.deepesh.ProjecrSubmission.Security.service.DualAdminApprovalService dualAdminApprovalService;

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        logger.info("Project submission controller health check called");
        return ResponseEntity.ok("Project Submission Controller is running");
    }

    @PostMapping("/create")
    @Operation(summary = "Create a new project submission")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Project submission created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid project submission data"),
            @ApiResponse(responseCode = "500", description = "Server error")
    })
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<?> createProjectSubmission(@Valid @RequestBody ProjectSubmission submission, BindingResult bindingResult) {
        logger.info("Creating project submission for employee ID: {}", submission.getEmployee_ID());
        try {
            // STAFF requires single admin approval for PROJECT_SUBMISSION; ADMIN bypasses
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            boolean isAdmin = dualAdminApprovalService.isCurrentUserAdmin();
            String currentUser = auth != null ? auth.getName() : null;
            if (!isAdmin) {
                String op = "FORM_APPROVAL:PROJECT_SUBMISSION";
                if (!dualAdminApprovalService.hasSingleApproval(op, currentUser)) {
                    return ResponseEntity.status(403).body(Map.of(
                            "error", "Admin approval required to use Project Submission create form",
                            "hint", "Ask an admin to approve via /api/approvals/forms/enable?username=" + currentUser + "&form=PROJECT_SUBMISSION"
                    ));
                }
            }
            ProjectSubmission savedSubmission = projectSubmissionService.save(submission, bindingResult);
            logger.info("Project submission created successfully for employee ID: {}", savedSubmission.getEmployee_ID());
            return ResponseEntity.status(201).body(savedSubmission);
        } catch (IllegalArgumentException e) {
            logger.error("Error creating project submission: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Server error creating project submission: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to create project submission: " + e.getMessage()));
        }
    }

    @GetMapping("/employee/{Employee_ID}")
    @Operation(summary = "Get project submissions by employee ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully retrieved project submissions"),
            @ApiResponse(responseCode = "404", description = "Project submission not found"),
            @ApiResponse(responseCode = "500", description = "Server error")
    })
    public ResponseEntity<?> getProjectSubmissionByEmployeeId(@PathVariable String Employee_ID) {
        logger.info("Fetching project submissions for employee ID: {}", Employee_ID);
        try {
            List<ProjectSubmission> submissions = projectSubmissionService.findByEmployeeId(Employee_ID);
            if (submissions.isEmpty()) {
                logger.warn("No project submissions found for employee ID: {}", Employee_ID);
                return ResponseEntity.notFound().build();
            }
            logger.info("Found {} project submissions for employee ID: {}", submissions.size(), Employee_ID);
            return ResponseEntity.ok(submissions);
        } catch (Exception e) {
            logger.error("Error retrieving project submissions for employee ID {}: {}", Employee_ID, e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Error retrieving project submissions: " + e.getMessage()));
        }
    }

    @GetMapping("/{Employee_ID}")
    @Operation(summary = "Get project submission by Employee ID (single result)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully retrieved project submission"),
            @ApiResponse(responseCode = "404", description = "Project submission not found"),
            @ApiResponse(responseCode = "500", description = "Server error")
    })
    public ResponseEntity<?> getProjectSubmissionById(@PathVariable String Employee_ID) {
        logger.info("Fetching single project submission for employee ID: {}", Employee_ID);
        try {
            List<ProjectSubmission> submissions = projectSubmissionService.findByEmployeeId(Employee_ID);
            if (submissions.isEmpty()) {
                logger.warn("No project submission found for employee ID: {}", Employee_ID);
                return ResponseEntity.notFound().build();
            }
            logger.info("Found project submission for employee ID: {}", Employee_ID);
            return ResponseEntity.ok(submissions.get(0)); // Return first submission
        } catch (Exception e) {
            logger.error("Error retrieving project submission for employee ID {}: {}", Employee_ID, e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Error retrieving project submission: " + e.getMessage()));
        }
    }

    @GetMapping("/project/{projectName}")
    @Operation(summary = "Get project submissions by project name")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully retrieved project submissions"),
            @ApiResponse(responseCode = "404", description = "Project submission not found"),
            @ApiResponse(responseCode = "500", description = "Server error")
    })
    public ResponseEntity<?> getProjectSubmissionByProjectName(@PathVariable String projectName) {
        logger.info("Fetching project submissions for project name: {}", projectName);
        try {
            List<ProjectSubmission> submissions = projectSubmissionService.findByProjectName(projectName);
            if (submissions.isEmpty()) {
                logger.warn("No project submissions found for project name: {}", projectName);
                return ResponseEntity.notFound().build();
            }
            logger.info("Found {} project submissions for project name: {}", submissions.size(), projectName);
            return ResponseEntity.ok(submissions);
        } catch (Exception e) {
            logger.error("Error retrieving project submissions for project name {}: {}", projectName, e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Error retrieving project submissions: " + e.getMessage()));
        }
    }

    @GetMapping("/department/{department}")
    @Operation(summary = "Get project submissions by department")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully retrieved project submissions"),
            @ApiResponse(responseCode = "500", description = "Server error")
    })
    public ResponseEntity<?> getProjectSubmissionByDepartment(@PathVariable String department) {
        logger.info("Fetching project submissions for department: {}", department);
        try {
            List<ProjectSubmission> submissions = projectSubmissionService.findByDepartment(department);
            logger.info("Found {} project submissions for department: {}", submissions.size(), department);
            return ResponseEntity.ok(submissions);
        } catch (Exception e) {
            logger.error("Error retrieving project submissions for department {}: {}", department, e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Error retrieving project submissions: " + e.getMessage()));
        }
    }

    @GetMapping("/funding-agency/{fundingAgencyId}")
    @Operation(summary = "Get project submissions by funding agency")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully retrieved project submissions"),
            @ApiResponse(responseCode = "500", description = "Server error")
    })
    public ResponseEntity<?> getProjectSubmissionByFundingAgency(@PathVariable String fundingAgencyId) {
        logger.info("Fetching project submissions for funding agency ID: {}", fundingAgencyId);
        try {
            List<ProjectSubmission> submissions = projectSubmissionService.findByFundingAgencyId(fundingAgencyId);
            logger.info("Found {} project submissions for funding agency ID: {}", submissions.size(), fundingAgencyId);
            return ResponseEntity.ok(submissions);
        } catch (Exception e) {
            logger.error("Error retrieving project submissions for funding agency ID {}: {}", fundingAgencyId, e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Error retrieving project submissions: " + e.getMessage()));
        }
    }

    @GetMapping("/search")
    @Operation(summary = "Search project submissions with filters")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully retrieved project submissions"),
            @ApiResponse(responseCode = "500", description = "Server error")
    })
    public ResponseEntity<?> searchProjectSubmissions(
            @RequestParam(required = false) String projectName,
            @RequestParam(required = false) String Employee_ID,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String faculty,
            @RequestParam(required = false) String typeOfProject,
            @RequestParam(required = false) String fundingAgencyId,
            @RequestParam(required = false) Double minCost,
            @RequestParam(required = false) Double maxCost,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        logger.info("Searching project submissions with filters");
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<ProjectSubmission> submissions = projectSubmissionService.searchProjectSubmissions(
                    projectName, Employee_ID, department, faculty, typeOfProject, 
                    fundingAgencyId, minCost, maxCost, startDate, endDate, pageable);
            logger.info("Found {} project submissions with filters", submissions.getTotalElements());
            return ResponseEntity.ok(submissions);
        } catch (Exception e) {
            logger.error("Error searching project submissions: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Error searching project submissions: " + e.getMessage()));
        }
    }

    @GetMapping("/all")
    @Operation(summary = "Get all project submissions without pagination")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully retrieved all project submissions"),
            @ApiResponse(responseCode = "500", description = "Server error")
    })
    public ResponseEntity<?> getAllProjectSubmissionsWithoutPagination() {
        logger.info("Fetching all project submissions without pagination");
        try {
            List<ProjectSubmission> submissions = projectSubmissionService.findAll();
            logger.info("Found {} project submissions", submissions.size());
            return ResponseEntity.ok(submissions);
        } catch (Exception e) {
            logger.error("Error retrieving project submissions: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Error retrieving project submissions: " + e.getMessage()));
        }
    }

    @GetMapping
    @Operation(summary = "Get all project submissions with pagination")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully retrieved project submissions"),
            @ApiResponse(responseCode = "500", description = "Server error")
    })
    public ResponseEntity<?> getAllProjectSubmissions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        logger.info("Fetching all project submissions with pagination");
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<ProjectSubmission> submissions = projectSubmissionService.findAllWithPagination(pageable);
            logger.info("Found {} project submissions with pagination", submissions.getTotalElements());
            return ResponseEntity.ok(submissions);
        } catch (Exception e) {
            logger.error("Error retrieving project submissions: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Error retrieving project submissions: " + e.getMessage()));
        }
    }

    @GetMapping("/stats/summary")
    @Operation(summary = "Get project submission statistics")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully retrieved statistics"),
            @ApiResponse(responseCode = "500", description = "Server error")
    })
    public ResponseEntity<?> getProjectSubmissionStats() {
        logger.info("Fetching project submission statistics");
        try {
            Map<String, Object> stats = projectSubmissionService.getProjectSubmissionStats();
            logger.info("Found project submission statistics");
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.error("Error retrieving project submission statistics: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Error retrieving statistics: " + e.getMessage()));
        }
    }

    @PutMapping("/{Employee_ID}")
    @Operation(summary = "Update project submission")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Project submission updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid project submission data"),
            @ApiResponse(responseCode = "404", description = "Project submission not found"),
            @ApiResponse(responseCode = "500", description = "Server error")
    })
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<?> updateProjectSubmission(@PathVariable String Employee_ID, @Valid @RequestBody ProjectSubmission submission, BindingResult bindingResult) {
        logger.info("Updating project submission for employee ID: {}", Employee_ID);
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            boolean isAdmin = dualAdminApprovalService.isCurrentUserAdmin();
            String currentUser = auth != null ? auth.getName() : null;
            if (!isAdmin) {
                String op = "FORM_APPROVAL:PROJECT_SUBMISSION";
                if (!dualAdminApprovalService.hasSingleApproval(op, currentUser)) {
                    return ResponseEntity.status(403).body(Map.of(
                            "error", "Admin approval required to use Project Submission update form",
                            "hint", "Ask an admin to approve via /api/approvals/forms/enable?username=" + currentUser + "&form=PROJECT_SUBMISSION"
                    ));
                }
            }
            ProjectSubmission updatedSubmission = projectSubmissionService.update(Employee_ID, submission, bindingResult);
            logger.info("Project submission updated successfully for employee ID: {}", updatedSubmission.getEmployee_ID());
            return ResponseEntity.ok(updatedSubmission);
        } catch (IllegalArgumentException e) {
            logger.error("Error updating project submission: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Server error updating project submission: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to update project submission: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{Employee_ID}")
    @Operation(summary = "Delete project submission")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Project submission deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Project submission not found"),
            @ApiResponse(responseCode = "500", description = "Server error")
    })
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<?> deleteProjectSubmission(@PathVariable String Employee_ID) {
        logger.info("Deleting project submission for employee ID: {}", Employee_ID);
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            boolean isAdmin = dualAdminApprovalService.isCurrentUserAdmin();
            String currentUser = auth != null ? auth.getName() : null;
            if (!isAdmin) {
                String op = "FORM_APPROVAL:PROJECT_SUBMISSION";
                if (!dualAdminApprovalService.hasSingleApproval(op, currentUser)) {
                    return ResponseEntity.status(403).body(Map.of(
                            "error", "Admin approval required to use Project Submission delete form",
                            "hint", "Ask an admin to approve via /api/approvals/forms/enable?username=" + currentUser + "&form=PROJECT_SUBMISSION"
                    ));
                }
            }
            boolean deleted = projectSubmissionService.deleteById(Employee_ID);
            if (deleted) {
                logger.info("Project submission deleted successfully for employee ID: {}", Employee_ID);
                return ResponseEntity.ok(Map.of("message", "Project submission deleted successfully"));
            } else {
                logger.warn("Project submission not found for employee ID: {}", Employee_ID);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error deleting project submission: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to delete project submission: " + e.getMessage()));
        }
    }
}