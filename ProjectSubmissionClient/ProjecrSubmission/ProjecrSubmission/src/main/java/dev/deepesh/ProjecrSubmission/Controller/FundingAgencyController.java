package dev.deepesh.ProjecrSubmission.Controller;

import dev.deepesh.ProjecrSubmission.Model.FundingAgency;
import dev.deepesh.ProjecrSubmission.Service.FundingAgencyService;
import dev.deepesh.ProjecrSubmission.Security.service.DualAdminApprovalService;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/funding-agencies")
public class FundingAgencyController {

    @Autowired
    private FundingAgencyService fundingAgencyService;

    @Autowired
    private DualAdminApprovalService dualAdminApprovalService;

    @PostMapping("/create")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Funding agency created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid funding agency data"),
            @ApiResponse(responseCode = "500", description = "Server error")
    })
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<?> createFundingAgency(@Valid @RequestBody FundingAgency fundingAgency, BindingResult bindingResult) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            boolean isAdmin = dualAdminApprovalService.isCurrentUserAdmin();
            String currentUser = auth != null ? auth.getName() : null;
            if (!isAdmin) {
                String op = "FORM_APPROVAL:FUNDING_AGENCY";
                if (!dualAdminApprovalService.hasSingleApproval(op, currentUser)) {
                    return ResponseEntity.status(403).body(Map.of(
                            "error", "Admin approval required to use Funding Agency create form",
                            "hint", "Ask an admin to approve via /api/approvals/forms/enable?username=" + currentUser + "&form=FUNDING_AGENCY"
                    ));
                }
            }
            FundingAgency savedAgency = fundingAgencyService.save(fundingAgency, bindingResult);
            return ResponseEntity.status(201).body(savedAgency);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/faId/{fundingAgencyId}")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved funding agency"),
            @ApiResponse(responseCode = "404", description = "Funding agency not found"),
            @ApiResponse(responseCode = "500", description = "Server error")
    })
    public ResponseEntity<?> getFundingAgencyById(@PathVariable String fundingAgencyId) {
        Optional<FundingAgency> fundingAgency = fundingAgencyService.findByFundingAgencyId(fundingAgencyId);
        return fundingAgency.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/faName/{fundingAgencyName}")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved funding agency"),
            @ApiResponse(responseCode = "404", description = "Funding agency not found"),
            @ApiResponse(responseCode = "500", description = "Server error")
    })
    public ResponseEntity<?> getFundingAgencyByName(@PathVariable String fundingAgencyName) {
        Optional<FundingAgency> fundingAgency = fundingAgencyService.findByFundingAgencyName(fundingAgencyName);
        return fundingAgency.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved funding agencies"),
            @ApiResponse(responseCode = "500", description = "Server error")
    })
    public ResponseEntity<List<FundingAgency>> getAllFundingAgencies() {
        List<FundingAgency> agencies = fundingAgencyService.findAll();
        return ResponseEntity.ok(agencies);
    }
}