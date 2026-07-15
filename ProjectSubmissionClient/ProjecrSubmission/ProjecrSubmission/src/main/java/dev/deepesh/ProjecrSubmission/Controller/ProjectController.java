package dev.deepesh.ProjecrSubmission.Controller;

import dev.deepesh.ProjecrSubmission.Model.Project;
import dev.deepesh.ProjecrSubmission.Service.ProjectService;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import dev.deepesh.ProjecrSubmission.Security.service.DualAdminApprovalService;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Valid
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
@RestController
@RequestMapping("/api/project")
public class ProjectController {

    private static final Logger logger = LoggerFactory.getLogger(ProjectController.class);

    @Autowired
    private ProjectService projectService;

    @Autowired
    private DualAdminApprovalService dualAdminApprovalService;

    @PostMapping("/create")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Project created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid project data"),
            @ApiResponse(responseCode = "500", description = "Server error")
    })
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<?> createProject(@Valid @RequestBody Project project, BindingResult bindingResult) {
        logger.info("Creating project with code: {}", project.getProjectCode());
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
                String op = "FORM_APPROVAL:PROJECT";
                boolean allowed = dualAdminApprovalService.hasSingleApproval(op, currentUser);
                if (!allowed) {
                    return ResponseEntity.status(403).body(Map.of(
                            "error","Admin approval required to use Project create form",
                            "hint", "Ask an admin to approve via /api/approvals/forms/enable?username=" + currentUser + "&form=PROJECT"
                    ));
                }
            }
            Project savedProject = projectService.save(project, bindingResult);
            logger.info("Project created successfully with code: {}", savedProject.getProjectCode());
            return ResponseEntity.status(201).body(savedProject);
        } catch (IllegalArgumentException e) {
            logger.error("Error creating project: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Server error creating project: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Server error: " + e.getMessage()));
        }
    }

    @GetMapping("/code/{projectCode}")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved project"),
            @ApiResponse(responseCode = "404", description = "Project not found"),
            @ApiResponse(responseCode = "500", description = "Server error")
    })
    public ResponseEntity<?> getProjectByCode(@PathVariable String projectCode) {
        logger.info("Fetching project with code: {}", projectCode);
        try {
            Optional<Project> project = projectService.findByProjectCode(projectCode);
            if (project.isPresent()) {
                logger.info("Project found with code: {}", projectCode);
                return ResponseEntity.ok(project.get());
            } else {
                logger.warn("Project not found with code: {}", projectCode);
                return ResponseEntity.status(404).body(Map.of("error", "Project not found with code: " + projectCode));
            }
        } catch (Exception e) {
            logger.error("Error fetching project with code {}: {}", projectCode, e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Server error: " + e.getMessage()));
        }
    }

    @GetMapping("/name/{projectName}")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved project"),
            @ApiResponse(responseCode = "404", description = "Project not found"),
            @ApiResponse(responseCode = "500", description = "Server error")
    })
    public ResponseEntity<Project> getProjectByName(@PathVariable String projectName) {
        Optional<Project> project = projectService.findByProjectName(projectName);
        return project.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved projects"),
            @ApiResponse(responseCode = "500", description = "Server error")
    })
    public ResponseEntity<List<Project>> getAllProjects() {
        try {
            List<Project> projects = projectService.findAll();
            return ResponseEntity.ok(projects);
        } catch (Exception e) {
            System.out.println(ExceptionUtils.getStackTrace(e));
            throw new RuntimeException(ExceptionUtils.getStackTrace(e));
        }
    }
}