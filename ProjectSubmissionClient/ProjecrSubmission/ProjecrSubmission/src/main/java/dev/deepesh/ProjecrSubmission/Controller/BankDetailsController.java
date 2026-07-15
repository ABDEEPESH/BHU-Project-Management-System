package dev.deepesh.ProjecrSubmission.Controller;

import dev.deepesh.ProjecrSubmission.Model.BankDetails;
import dev.deepesh.ProjecrSubmission.Service.BankDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/bank-details")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
public class BankDetailsController {

    @Autowired
    private BankDetailsService bankDetailsService;

    // Get all bank details
    @GetMapping
    public ResponseEntity<List<BankDetails>> getAllBankDetails() {
        try {
            List<BankDetails> bankDetails = bankDetailsService.getAllBankDetails();
            return ResponseEntity.ok(bankDetails);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get bank details by ID
    @GetMapping("/{id}")
    public ResponseEntity<BankDetails> getBankDetailsById(@PathVariable String id) {
        try {
            Optional<BankDetails> bankDetails = bankDetailsService.getBankDetailsById(id);
            if (bankDetails.isPresent()) {
                return ResponseEntity.ok(bankDetails.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get bank details by bank name
    @GetMapping("/bank/{bankName}")
    public ResponseEntity<BankDetails> getBankDetailsByBankName(@PathVariable String bankName) {
        try {
            Optional<BankDetails> bankDetails = bankDetailsService.getBankDetailsByBankName(bankName);
            if (bankDetails.isPresent()) {
                return ResponseEntity.ok(bankDetails.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get bank details by account number
    @GetMapping("/account/{accountNumber}")
    public ResponseEntity<BankDetails> getBankDetailsByAccountNumber(@PathVariable String accountNumber) {
        try {
            Optional<BankDetails> bankDetails = bankDetailsService.getBankDetailsByAccountNumber(accountNumber);
            if (bankDetails.isPresent()) {
                return ResponseEntity.ok(bankDetails.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get bank details by IFSC code
    @GetMapping("/ifsc/{ifscCode}")
    public ResponseEntity<List<BankDetails>> getBankDetailsByIfscCode(@PathVariable String ifscCode) {
        try {
            List<BankDetails> bankDetails = bankDetailsService.getBankDetailsByIfscCode(ifscCode);
            return ResponseEntity.ok(bankDetails);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get active bank details
    @GetMapping("/active")
    public ResponseEntity<List<BankDetails>> getActiveBankDetails() {
        try {
            List<BankDetails> bankDetails = bankDetailsService.getActiveBankDetails();
            return ResponseEntity.ok(bankDetails);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Create new bank details
    @PostMapping("/create")
    @PreAuthorize("hasAnyRole('ADMIN','FORM')")
    public ResponseEntity<BankDetails> createBankDetails(@RequestBody BankDetails bankDetails) {
        try {
            BankDetails createdBankDetails = bankDetailsService.createBankDetails(bankDetails);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdBankDetails);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Update bank details
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','FORM')")
    public ResponseEntity<BankDetails> updateBankDetails(@PathVariable String id, @RequestBody BankDetails bankDetails) {
        try {
            BankDetails updatedBankDetails = bankDetailsService.updateBankDetails(id, bankDetails);
            return ResponseEntity.ok(updatedBankDetails);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Delete bank details
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBankDetails(@PathVariable String id) {
        try {
            bankDetailsService.deleteBankDetails(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
