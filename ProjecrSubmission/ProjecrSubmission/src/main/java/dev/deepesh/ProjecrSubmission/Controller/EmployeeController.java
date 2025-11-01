package dev.deepesh.ProjecrSubmission.Controller;

import dev.deepesh.ProjecrSubmission.Model.Employee;
import dev.deepesh.ProjecrSubmission.Service.EmployeeService;
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
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import dev.deepesh.ProjecrSubmission.Security.service.DualAdminApprovalService;

@Valid
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
@RestController
@RequestMapping("/api/employee")
public class EmployeeController {

    private static final Logger logger = LoggerFactory.getLogger(EmployeeController.class);

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private DualAdminApprovalService dualAdminApprovalService;

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        logger.info("Employee controller health check called");
        return ResponseEntity.ok("Employee Controller is running");
    }

    @PostMapping("/create")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Employee created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid employee data or duplicate ID No"),
            @ApiResponse(responseCode = "500", description = "Server error")
    })
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<?> createEmployee(@Valid @RequestBody Employee employee, BindingResult bindingResult) {
        logger.info("Creating employee with ID: {}", employee.getIdNo());
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
                String op = "FORM_APPROVAL:EMPLOYEE";
                boolean allowed = dualAdminApprovalService.hasSingleApproval(op, currentUser);
                if (!allowed) {
                    return ResponseEntity.status(403).body(Map.of(
                            "error", "Admin approval required to use Employee create form",
                            "hint", "Ask an admin to approve via /api/approvals/forms/enable?username=" + currentUser + "&form=EMPLOYEE"
                    ));
                }
            }
            Employee savedEmployee = employeeService.save(employee, bindingResult);
            logger.info("Employee created successfully with ID: {}", savedEmployee.getIdNo());
            return ResponseEntity.status(201).body(savedEmployee);
        } catch (IllegalArgumentException e) {
            logger.error("Error creating employee: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("Server error creating employee: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Server error: " + e.getMessage());
        }
    }

    @GetMapping("/eid/{idNo}")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved employee"),
            @ApiResponse(responseCode = "404", description = "Employee not found"),
            @ApiResponse(responseCode = "500", description = "Server error")
    })
    public ResponseEntity<?> getEmployeeAndProject(@PathVariable String idNo) {
        logger.info("Fetching employee with ID: {}", idNo);
        try {
            Optional<Employee> employee = employeeService.findByIdNo(idNo);
            if (employee.isPresent()) {
                logger.info("Employee found with ID: {}", idNo);
                return ResponseEntity.ok(employee.get());
            } else {
                logger.warn("Employee not found with ID: {}", idNo);
                return ResponseEntity.status(404).body(Map.of("error", "Employee not found with ID: " + idNo));
            }
        } catch (Exception e) {
            logger.error("Error fetching employee with ID {}: {}", idNo, e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Server error: " + e.getMessage()));
        }
    }

    @GetMapping
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved employees"),
            @ApiResponse(responseCode = "500", description = "Server error")
    })
    public ResponseEntity<?> getAllEmployees() {
        logger.info("Fetching all employees");
        try {
            List<Employee> employees = employeeService.findAll();
            logger.info("Found {} employees", employees.size());
            return ResponseEntity.ok(employees);
        } catch (Exception e) {
            logger.error("Error fetching all employees: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Server error: " + e.getMessage()));
        }
    }

    @GetMapping("/debug/count")
    public ResponseEntity<?> getEmployeeCount() {
        logger.info("Getting employee count for debugging");
        try {
            long count = employeeService.getCount();
            logger.info("Total employee count: {}", count);
            return ResponseEntity.ok(Map.of("totalCount", count, "message", "Employee count retrieved successfully"));
        } catch (Exception e) {
            logger.error("Error getting employee count: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Server error: " + e.getMessage()));
        }
    }
}