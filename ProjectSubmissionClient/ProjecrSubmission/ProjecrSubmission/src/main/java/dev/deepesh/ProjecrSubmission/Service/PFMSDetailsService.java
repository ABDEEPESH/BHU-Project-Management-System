package dev.deepesh.ProjecrSubmission.Service;

import dev.deepesh.ProjecrSubmission.Model.PFMSDetails;
import dev.deepesh.ProjecrSubmission.Repository.PFMSDetailsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PFMSDetailsService {

    @Autowired
    private PFMSDetailsRepository pfmsDetailsRepository;

    // Get all PFMS details
    public List<PFMSDetails> getAllPFMSDetails() {
        return pfmsDetailsRepository.findAll();
    }

    // Get PFMS details by ID
    public Optional<PFMSDetails> getPFMSDetailsById(String id) {
        return pfmsDetailsRepository.findById(id);
    }

    // Get PFMS details by scheme name
    public Optional<PFMSDetails> getPFMSDetailsByScheme(String pfmsScheme) {
        return pfmsDetailsRepository.findByPfmsScheme(pfmsScheme);
    }

    // Get PFMS details by scheme code
    public Optional<PFMSDetails> getPFMSDetailsBySchemeCode(String schemeCode) {
        return pfmsDetailsRepository.findBySchemeCode(schemeCode);
    }

    // Get active PFMS details
    public List<PFMSDetails> getActivePFMSDetails() {
        return pfmsDetailsRepository.findByIsActive(true);
    }

    // Search PFMS details by description
    public List<PFMSDetails> searchPFMSDetailsByDescription(String description) {
        return pfmsDetailsRepository.findByDescriptionContainingIgnoreCase(description);
    }

    // Create new PFMS details
    public PFMSDetails createPFMSDetails(PFMSDetails pfmsDetails) {
        try {
            // Check if scheme code already exists
            Optional<PFMSDetails> existing = pfmsDetailsRepository.findBySchemeCode(pfmsDetails.getSchemeCode());
            if (existing.isPresent()) {
                throw new RuntimeException("PFMS scheme with this scheme code already exists");
            }
            
            return pfmsDetailsRepository.save(pfmsDetails);
        } catch (Exception e) {
            throw new RuntimeException("Error creating PFMS details: " + e.getMessage());
        }
    }

    // Update PFMS details
    public PFMSDetails updatePFMSDetails(String id, PFMSDetails pfmsDetails) {
        try {
            Optional<PFMSDetails> existingPFMSDetails = pfmsDetailsRepository.findById(id);
            if (existingPFMSDetails.isPresent()) {
                PFMSDetails updated = existingPFMSDetails.get();
                updated.setPfmsScheme(pfmsDetails.getPfmsScheme());
                updated.setSchemeCode(pfmsDetails.getSchemeCode());
                updated.setDescription(pfmsDetails.getDescription());
                updated.setActive(pfmsDetails.isActive());
                return pfmsDetailsRepository.save(updated);
            } else {
                throw new RuntimeException("PFMS details not found with id: " + id);
            }
        } catch (Exception e) {
            throw new RuntimeException("Error updating PFMS details: " + e.getMessage());
        }
    }

    // Delete PFMS details
    public void deletePFMSDetails(String id) {
        try {
            if (pfmsDetailsRepository.existsById(id)) {
                pfmsDetailsRepository.deleteById(id);
            } else {
                throw new RuntimeException("PFMS details not found with id: " + id);
            }
        } catch (Exception e) {
            throw new RuntimeException("Error deleting PFMS details: " + e.getMessage());
        }
    }

    // Check if PFMS details exists
    public boolean pfmsDetailsExists(String id) {
        return pfmsDetailsRepository.existsById(id);
    }
}
