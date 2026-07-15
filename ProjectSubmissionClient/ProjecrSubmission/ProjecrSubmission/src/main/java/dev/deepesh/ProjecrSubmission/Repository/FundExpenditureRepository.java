package dev.deepesh.ProjecrSubmission.Repository;

import dev.deepesh.ProjecrSubmission.Model.FundExpenditure;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FundExpenditureRepository extends MongoRepository<FundExpenditure, String> {
    
    // Find all expenditures by project code
    List<FundExpenditure> findByProjectCode(String projectCode);
    
    // Find all expenditures by financial year
    List<FundExpenditure> findByFinancialYear(String financialYear);
    
    // Find expenditures by project code and financial year
    List<FundExpenditure> findByProjectCodeAndFinancialYear(String projectCode, String financialYear);
    
    // Check if expenditure exists by project code and financial year
    boolean existsByProjectCodeAndFinancialYear(String projectCode, String financialYear);
}
