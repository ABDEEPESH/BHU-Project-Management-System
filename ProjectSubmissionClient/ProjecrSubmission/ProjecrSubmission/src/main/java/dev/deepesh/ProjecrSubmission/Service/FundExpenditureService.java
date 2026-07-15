package dev.deepesh.ProjecrSubmission.Service;

import dev.deepesh.ProjecrSubmission.Model.FundExpenditure;
import dev.deepesh.ProjecrSubmission.Repository.FundExpenditureRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FundExpenditureService {

    @Autowired
    private FundExpenditureRepository fundExpenditureRepository;

    // Create new fund expenditure
    public FundExpenditure createFundExpenditure(FundExpenditure fundExpenditure) {
        // Calculate total expenditure before saving
        fundExpenditure.calculateTotalExpenditure();
        return fundExpenditureRepository.save(fundExpenditure);
    }

    // Get all fund expenditures
    public List<FundExpenditure> getAllFundExpenditures() {
        return fundExpenditureRepository.findAll();
    }

    // Get fund expenditure by ID
    public Optional<FundExpenditure> getFundExpenditureById(String id) {
        return fundExpenditureRepository.findById(id);
    }

    // Get fund expenditures by project code
    public List<FundExpenditure> getFundExpendituresByProjectCode(String projectCode) {
        return fundExpenditureRepository.findByProjectCode(projectCode);
    }

    // Get fund expenditures by financial year
    public List<FundExpenditure> getFundExpendituresByFinancialYear(String financialYear) {
        return fundExpenditureRepository.findByFinancialYear(financialYear);
    }

    // Get fund expenditures by project code and financial year
    public List<FundExpenditure> getFundExpendituresByProjectCodeAndFinancialYear(String projectCode, String financialYear) {
        return fundExpenditureRepository.findByProjectCodeAndFinancialYear(projectCode, financialYear);
    }

    // Update fund expenditure
    public FundExpenditure updateFundExpenditure(String id, FundExpenditure fundExpenditure) {
        Optional<FundExpenditure> existingExpenditure = fundExpenditureRepository.findById(id);
        if (existingExpenditure.isPresent()) {
            FundExpenditure updatedExpenditure = existingExpenditure.get();
            updatedExpenditure.setProjectCode(fundExpenditure.getProjectCode());
            updatedExpenditure.setFinancialYear(fundExpenditure.getFinancialYear());
            updatedExpenditure.setEquipmentPurchase(fundExpenditure.getEquipmentPurchase());
            updatedExpenditure.setSalary(fundExpenditure.getSalary());
            updatedExpenditure.setContingency(fundExpenditure.getContingency());
            updatedExpenditure.setOverhead(fundExpenditure.getOverhead());
            updatedExpenditure.setDateOfExpenditure(fundExpenditure.getDateOfExpenditure());
            updatedExpenditure.setRemark(fundExpenditure.getRemark());
            updatedExpenditure.calculateTotalExpenditure();
            return fundExpenditureRepository.save(updatedExpenditure);
        }
        throw new RuntimeException("Fund expenditure not found with id: " + id);
    }

    // Delete fund expenditure
    public void deleteFundExpenditure(String id) {
        fundExpenditureRepository.deleteById(id);
    }

    // Check if expenditure exists by project code and financial year
    public boolean existsByProjectCodeAndFinancialYear(String projectCode, String financialYear) {
        return fundExpenditureRepository.existsByProjectCodeAndFinancialYear(projectCode, financialYear);
    }
}
