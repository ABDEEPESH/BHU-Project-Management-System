package dev.deepesh.ProjecrSubmission.Controller;

import dev.deepesh.ProjecrSubmission.Model.PFMSDetails;
import dev.deepesh.ProjecrSubmission.Service.PFMSDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/pfms-details")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
public class PFMSDetailsController {

    @Autowired
    private PFMSDetailsService pfmsDetailsService;

    // Get all PFMS details
    @GetMapping
    public ResponseEntity<List<PFMSDetails>> getAllPFMSDetails() {
        try {
            List<PFMSDetails> pfmsDetails = pfmsDetailsService.getAllPFMSDetails();
            return ResponseEntity.ok(pfmsDetails);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get PFMS details by ID
    @GetMapping("/{id}")
    public ResponseEntity<PFMSDetails> getPFMSDetailsById(@PathVariable String id) {
        try {
            Optional<PFMSDetails> pfmsDetails = pfmsDetailsService.getPFMSDetailsById(id);
            if (pfmsDetails.isPresent()) {
                return ResponseEntity.ok(pfmsDetails.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get PFMS details by scheme name
    @GetMapping("/scheme/{schemeName}")
    public ResponseEntity<PFMSDetails> getPFMSDetailsByScheme(@PathVariable String schemeName) {
        try {
            Optional<PFMSDetails> pfmsDetails = pfmsDetailsService.getPFMSDetailsByScheme(schemeName);
            if (pfmsDetails.isPresent()) {
                return ResponseEntity.ok(pfmsDetails.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get PFMS details by scheme code
    @GetMapping("/code/{schemeCode}")
    public ResponseEntity<PFMSDetails> getPFMSDetailsBySchemeCode(@PathVariable String schemeCode) {
        try {
            Optional<PFMSDetails> pfmsDetails = pfmsDetailsService.getPFMSDetailsBySchemeCode(schemeCode);
            if (pfmsDetails.isPresent()) {
                return ResponseEntity.ok(pfmsDetails.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get active PFMS details
    @GetMapping("/active")
    public ResponseEntity<List<PFMSDetails>> getActivePFMSDetails() {
        try {
            List<PFMSDetails> pfmsDetails = pfmsDetailsService.getActivePFMSDetails();
            return ResponseEntity.ok(pfmsDetails);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Search PFMS details by description
    @GetMapping("/search")
    public ResponseEntity<List<PFMSDetails>> searchPFMSDetailsByDescription(@RequestParam String description) {
        try {
            List<PFMSDetails> pfmsDetails = pfmsDetailsService.searchPFMSDetailsByDescription(description);
            return ResponseEntity.ok(pfmsDetails);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Create new PFMS details
    @PostMapping("/create")
    @PreAuthorize("hasAnyRole('ADMIN','FORM')")
    public ResponseEntity<PFMSDetails> createPFMSDetails(@RequestBody PFMSDetails pfmsDetails) {
        try {
            PFMSDetails createdPFMSDetails = pfmsDetailsService.createPFMSDetails(pfmsDetails);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdPFMSDetails);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Update PFMS details
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','FORM')")
    public ResponseEntity<PFMSDetails> updatePFMSDetails(@PathVariable String id, @RequestBody PFMSDetails pfmsDetails) {
        try {
            PFMSDetails updatedPFMSDetails = pfmsDetailsService.updatePFMSDetails(id, pfmsDetails);
            return ResponseEntity.ok(updatedPFMSDetails);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Delete PFMS details
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePFMSDetails(@PathVariable String id) {
        try {
            pfmsDetailsService.deletePFMSDetails(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
