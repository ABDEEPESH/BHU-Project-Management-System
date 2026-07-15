package dev.deepesh.ProjecrSubmission.Service;

import dev.deepesh.ProjecrSubmission.Model.FundReceipt;
import dev.deepesh.ProjecrSubmission.Repository.FundReceiptRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.validation.BindingResult;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FundReceiptService {

    @Autowired
    private FundReceiptRepository fundReceiptRepository;

    public Optional<FundReceipt> findById(String id) {
        return fundReceiptRepository.findById(id);
    }

    public Optional<FundReceipt> findByReceiptNumber(String receiptNumber) {
        return fundReceiptRepository.findByReceiptNumber(receiptNumber);
    }

    public List<FundReceipt> findByProjectNumber(String projectNumber) {
        return fundReceiptRepository.findByProjectNumber(projectNumber);
    }

    public List<FundReceipt> findByIdNo(String idNo) {
        return fundReceiptRepository.findByIdNo(idNo);
    }

    public List<FundReceipt> findAll() {
        return fundReceiptRepository.findAll();
    }

    public Page<FundReceipt> findAllWithPagination(Pageable pageable) {
        return fundReceiptRepository.findAll(pageable);
    }

    public FundReceipt save(@Valid FundReceipt receipt, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            throw new IllegalArgumentException(
                    bindingResult.getFieldErrors().stream()
                            .map(error -> error.getField() + ": " + error.getDefaultMessage())
                            .collect(Collectors.joining(", "))
            );
        }

        validateFundReceipt(receipt);

        return fundReceiptRepository.save(receipt);
    }

    public FundReceipt update(String id, @Valid FundReceipt receipt, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            throw new IllegalArgumentException(
                    bindingResult.getFieldErrors().stream()
                            .map(error -> error.getField() + ": " + error.getDefaultMessage())
                            .collect(Collectors.joining(", "))
            );
        }

        findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Fund receipt not found with ID: " + id));

        validateFundReceipt(receipt);

        receipt.setIdNo(id);
        return fundReceiptRepository.save(receipt);
    }

    public boolean deleteById(String id) {
        if (fundReceiptRepository.existsById(id)) {
            fundReceiptRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public boolean deleteByReceiptNumber(String receiptNumber) {
        Optional<FundReceipt> receipt = fundReceiptRepository.findByReceiptNumber(receiptNumber);
        if (receipt.isPresent()) {
            fundReceiptRepository.delete(receipt.get());
            return true;
        }
        return false;
    }

    private void validateFundReceipt(FundReceipt receipt) {
        if (receipt.getReceiptNumber() == null || receipt.getReceiptNumber().trim().isEmpty()) {
            throw new IllegalArgumentException("Receipt Number is required");
        }
        if (Double.isNaN(receipt.getTotalAmount()) || receipt.getTotalAmount() < 0) {
            throw new IllegalArgumentException("Total Amount must be a valid non-negative number");
        }
        if (Double.isNaN(receipt.getRecurringAmount()) || receipt.getRecurringAmount() < 0) {
            throw new IllegalArgumentException("Recurring Amount must be a valid non-negative number");
        }
        if (Double.isNaN(receipt.getNonRecurringAmount()) || receipt.getNonRecurringAmount() < 0) {
            throw new IllegalArgumentException("Non-Recurring Amount must be a valid non-negative number");
        }
        if (Double.isNaN(receipt.getOverheadAmount()) || receipt.getOverheadAmount() < 0) {
            throw new IllegalArgumentException("Overhead Amount must be a valid non-negative number");
        }
        if (Math.abs(receipt.getRecurringAmount() + receipt.getNonRecurringAmount() + receipt.getOverheadAmount() - receipt.getTotalAmount()) > 0.01) {
            throw new IllegalArgumentException("Recurring + Non-Recurring + Overhead must equal Total Amount");
        }
        if (receipt.getSanctionDate() != null && !receipt.getSanctionDate().matches("\\d{4}-\\d{2}-\\d{2}")) {
            throw new IllegalArgumentException("Invalid sanction date format (YYYY-MM-DD)");
        }
        if (receipt.getChallanDate() != null && !receipt.getChallanDate().matches("\\d{4}-\\d{2}-\\d{2}")) {
            throw new IllegalArgumentException("Invalid challan date format (YYYY-MM-DD)");
        }
        if (receipt.getFinancialYear() != null && !receipt.getFinancialYear().matches("\\d{4}-\\d{4}")) {
            throw new IllegalArgumentException("Invalid financial year format (YYYY-YYYY)");
        }
        if (receipt.isUsePFMS()) {
            if (receipt.getPfmsScheme() == null || receipt.getPfmsScheme().trim().isEmpty()) {
                throw new IllegalArgumentException("PFMS Scheme is required when PFMS is used");
            }
            if (receipt.getBankName() == null || receipt.getBankName().trim().isEmpty()) {
                throw new IllegalArgumentException("Bank Name is required when PFMS is used");
            }
            if (receipt.getAccountNumber() == null || receipt.getAccountNumber().trim().isEmpty()) {
                throw new IllegalArgumentException("Account Number is required when PFMS is used");
            }
            if (receipt.getAccountName() == null || receipt.getAccountName().trim().isEmpty()) {
                throw new IllegalArgumentException("Account Name is required when PFMS is used");
            }
        }
    }
}