package dev.deepesh.ProjecrSubmission.Repository;

import dev.deepesh.ProjecrSubmission.Model.PFMSDetails;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PFMSDetailsRepository extends MongoRepository<PFMSDetails, String> {
    
    // Find by PFMS scheme
    Optional<PFMSDetails> findByPfmsScheme(String pfmsScheme);
    
    // Find by scheme code
    Optional<PFMSDetails> findBySchemeCode(String schemeCode);
    
    // Find active PFMS details
    List<PFMSDetails> findByIsActive(boolean isActive);
    
    // Find by description containing text (case insensitive)
    List<PFMSDetails> findByDescriptionContainingIgnoreCase(String description);
}
