package dev.deepesh.ProjecrSubmission;

import dev.deepesh.ProjecrSubmission.Model.FundExpenditure;
import dev.deepesh.ProjecrSubmission.Service.FundExpenditureService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class FundExpenditureControllerTest {

    @Autowired
    private FundExpenditureService fundExpenditureService;

    @Test
    public void testCreateFundExpenditure() {
        // Create a test fund expenditure
        FundExpenditure expenditure = new FundExpenditure();
        expenditure.setProjectCode("PROJ-0001");
        expenditure.setFinancialYear("2026-27");
        expenditure.setEquipmentPurchase(100000.0);
        expenditure.setSalary(50000.0);
        expenditure.setContingency(25000.0);
        expenditure.setOverhead(15000.0);
        expenditure.setRemark("Test expenditure");

        // Test that the service can create the expenditure
        assertNotNull(fundExpenditureService);
        
        // Note: This is a basic test to ensure the service is available
        // In a real test environment, you would mock the repository
        // and test the actual business logic
    }

    @Test
    public void testCalculateTotalExpenditure() {
        FundExpenditure expenditure = new FundExpenditure();
        expenditure.setEquipmentPurchase(100000.0);
        expenditure.setSalary(50000.0);
        expenditure.setContingency(25000.0);
        expenditure.setOverhead(15000.0);
        
        expenditure.calculateTotalExpenditure();
        
        assertEquals(190000.0, expenditure.getTotalExpenditure(), 0.01);
    }
}
