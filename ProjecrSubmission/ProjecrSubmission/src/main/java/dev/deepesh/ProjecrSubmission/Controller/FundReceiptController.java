package dev.deepesh.ProjecrSubmission.Controller;

import dev.deepesh.ProjecrSubmission.Model.FundReceipt;
import dev.deepesh.ProjecrSubmission.Service.FundReceiptService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
@RestController
@RequestMapping("/api/fund-receipt")
public class FundReceiptController {

    @Autowired
    private FundReceiptService fundReceiptService;

    @PostMapping("/create")
    @Operation(summary = "Create a new fund receipt")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Fund receipt created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid fund receipt data"),
            @ApiResponse(responseCode = "500", description = "Server error")
    })
    @PreAuthorize("hasAnyRole('ADMIN','FORM')")
    public ResponseEntity<?> createFundReceipt(@Valid @RequestBody FundReceipt receipt, BindingResult bindingResult) {
        try {
            FundReceipt savedReceipt = fundReceiptService.save(receipt, bindingResult);
            return ResponseEntity.status(201).body(savedReceipt);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to create fund receipt: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get fund receipt by ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully retrieved fund receipt"),
            @ApiResponse(responseCode = "404", description = "Fund receipt not found"),
            @ApiResponse(responseCode = "500", description = "Server error")
    })
    public ResponseEntity<?> getFundReceiptById(@PathVariable String id) {
        try {
            return fundReceiptService.findById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error retrieving fund receipt: " + e.getMessage()));
        }
    }

    @GetMapping("/employee/{employeeId}")
    @Operation(summary = "Get fund receipts by employee ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully retrieved fund receipts"),
            @ApiResponse(responseCode = "404", description = "Fund receipt not found"),
            @ApiResponse(responseCode = "500", description = "Server error")
    })
    public ResponseEntity<?> getFundReceiptByEmployeeId(@PathVariable String employeeId) {
        try {
            List<FundReceipt> receipts = fundReceiptService.findByIdNo(employeeId);
            if (receipts.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(receipts);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error retrieving fund receipts: " + e.getMessage()));
        }
    }

    @GetMapping("/project/{projectNumber}")
    @Operation(summary = "Get fund receipts by project number")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully retrieved fund receipts"),
            @ApiResponse(responseCode = "404", description = "Fund receipt not found"),
            @ApiResponse(responseCode = "500", description = "Server error")
    })
    public ResponseEntity<?> getFundReceiptByProjectNumber(@PathVariable String projectNumber) {
        try {
            List<FundReceipt> receipts = fundReceiptService.findByProjectNumber(projectNumber);
            if (receipts.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(receipts);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error retrieving fund receipts: " + e.getMessage()));
        }
    }

    @GetMapping
    @Operation(summary = "Get all fund receipts with pagination")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully retrieved fund receipts"),
            @ApiResponse(responseCode = "500", description = "Server error")
    })
    public ResponseEntity<?> getAllFundReceipts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<FundReceipt> receipts = fundReceiptService.findAllWithPagination(pageable);
            return ResponseEntity.ok(receipts);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error retrieving fund receipts: " + e.getMessage()));
        }
    }

    @GetMapping("/all")
    @Operation(summary = "Get all fund receipts without pagination")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully retrieved all fund receipts"),
            @ApiResponse(responseCode = "500", description = "Server error")
    })
    public ResponseEntity<?> getAllFundReceiptsWithoutPagination() {
        try {
            List<FundReceipt> receipts = fundReceiptService.findAll();
            return ResponseEntity.ok(receipts);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error retrieving fund receipts: " + e.getMessage()));
        }
    }

    @GetMapping("/receipt-number/{receiptNumber}")
    @Operation(summary = "Get fund receipt by receipt number")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully retrieved fund receipt"),
            @ApiResponse(responseCode = "404", description = "Fund receipt not found"),
            @ApiResponse(responseCode = "500", description = "Server error")
    })
    public ResponseEntity<?> getFundReceiptByReceiptNumber(@PathVariable String receiptNumber) {
        try {
            return fundReceiptService.findByReceiptNumber(receiptNumber)
                    .map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error retrieving fund receipt: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update fund receipt")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Fund receipt updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid fund receipt data"),
            @ApiResponse(responseCode = "404", description = "Fund receipt not found"),
            @ApiResponse(responseCode = "500", description = "Server error")
    })
    @PreAuthorize("hasAnyRole('ADMIN','FORM')")
    public ResponseEntity<?> updateFundReceipt(@PathVariable String id, @Valid @RequestBody FundReceipt receipt, BindingResult bindingResult) {
        try {
            FundReceipt updatedReceipt = fundReceiptService.update(id, receipt, bindingResult);
            return ResponseEntity.ok(updatedReceipt);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to update fund receipt: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete fund receipt by ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Fund receipt deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Fund receipt not found"),
            @ApiResponse(responseCode = "500", description = "Server error")
    })
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteFundReceipt(@PathVariable String id) {
        try {
            boolean deleted = fundReceiptService.deleteById(id);
            if (deleted) {
                return ResponseEntity.ok(Map.of("message", "Fund receipt deleted successfully"));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to delete fund receipt: " + e.getMessage()));
        }
    }

    @DeleteMapping("/receipt-number/{receiptNumber}")
    @Operation(summary = "Delete fund receipt by receipt number")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Fund receipt deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Fund receipt not found"),
            @ApiResponse(responseCode = "500", description = "Server error")
    })
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteFundReceiptByReceiptNumber(@PathVariable String receiptNumber) {
        try {
            boolean deleted = fundReceiptService.deleteByReceiptNumber(receiptNumber);
            if (deleted) {
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to delete fund receipt: " + e.getMessage()));
        }
    }
}