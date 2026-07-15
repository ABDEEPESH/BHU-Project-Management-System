package dev.deepesh.ProjecrSubmission.Repository;

import dev.deepesh.ProjecrSubmission.Model.BankDetails;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BankDetailsRepository extends MongoRepository<BankDetails, String> {
    
    // Find by bank name
    Optional<BankDetails> findByBankName(String bankName);
    
    // Find by account number
    Optional<BankDetails> findByAccountNumber(String accountNumber);
    
    // Find by IFSC code
    List<BankDetails> findByIfscCode(String ifscCode);
    
    // Find active bank details
    List<BankDetails> findByIsActive(boolean isActive);
    
    // Find by bank name and account type
    List<BankDetails> findByBankNameAndAccountType(String bankName, String accountType);
}
