package dev.deepesh.ProjecrSubmission.Service;

import dev.deepesh.ProjecrSubmission.Model.BankDetails;
import dev.deepesh.ProjecrSubmission.Repository.BankDetailsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BankDetailsService {

    @Autowired
    private BankDetailsRepository bankDetailsRepository;

    // Get all bank details
    public List<BankDetails> getAllBankDetails() {
        return bankDetailsRepository.findAll();
    }

    // Get bank details by ID
    public Optional<BankDetails> getBankDetailsById(String id) {
        return bankDetailsRepository.findById(id);
    }

    // Get bank details by bank name
    public Optional<BankDetails> getBankDetailsByBankName(String bankName) {
        return bankDetailsRepository.findByBankName(bankName);
    }

    // Get bank details by account number
    public Optional<BankDetails> getBankDetailsByAccountNumber(String accountNumber) {
        return bankDetailsRepository.findByAccountNumber(accountNumber);
    }

    // Get bank details by IFSC code
    public List<BankDetails> getBankDetailsByIfscCode(String ifscCode) {
        return bankDetailsRepository.findByIfscCode(ifscCode);
    }

    // Get active bank details
    public List<BankDetails> getActiveBankDetails() {
        return bankDetailsRepository.findByIsActive(true);
    }

    // Get bank details by bank name and account type
    public List<BankDetails> getBankDetailsByBankNameAndAccountType(String bankName, String accountType) {
        return bankDetailsRepository.findByBankNameAndAccountType(bankName, accountType);
    }

    // Create new bank details
    public BankDetails createBankDetails(BankDetails bankDetails) {
        try {
            // Check if account number already exists
            Optional<BankDetails> existing = bankDetailsRepository.findByAccountNumber(bankDetails.getAccountNumber());
            if (existing.isPresent()) {
                throw new RuntimeException("Bank account with this account number already exists");
            }
            
            return bankDetailsRepository.save(bankDetails);
        } catch (Exception e) {
            throw new RuntimeException("Error creating bank details: " + e.getMessage());
        }
    }

    // Update bank details
    public BankDetails updateBankDetails(String id, BankDetails bankDetails) {
        try {
            Optional<BankDetails> existingBankDetails = bankDetailsRepository.findById(id);
            if (existingBankDetails.isPresent()) {
                BankDetails updated = existingBankDetails.get();
                updated.setBankName(bankDetails.getBankName());
                updated.setAccountNumber(bankDetails.getAccountNumber());
                updated.setAccountName(bankDetails.getAccountName());
                updated.setIfscCode(bankDetails.getIfscCode());
                updated.setBranchName(bankDetails.getBranchName());
                updated.setAccountType(bankDetails.getAccountType());
                updated.setActive(bankDetails.isActive());
                return bankDetailsRepository.save(updated);
            } else {
                throw new RuntimeException("Bank details not found with id: " + id);
            }
        } catch (Exception e) {
            throw new RuntimeException("Error updating bank details: " + e.getMessage());
        }
    }

    // Delete bank details
    public void deleteBankDetails(String id) {
        try {
            if (bankDetailsRepository.existsById(id)) {
                bankDetailsRepository.deleteById(id);
            } else {
                throw new RuntimeException("Bank details not found with id: " + id);
            }
        } catch (Exception e) {
            throw new RuntimeException("Error deleting bank details: " + e.getMessage());
        }
    }

    // Check if bank details exists
    public boolean bankDetailsExists(String id) {
        return bankDetailsRepository.existsById(id);
    }
}
