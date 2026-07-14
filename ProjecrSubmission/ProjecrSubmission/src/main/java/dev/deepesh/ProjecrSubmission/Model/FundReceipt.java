package dev.deepesh.ProjecrSubmission.Model;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Data
@Document(collection = "FundReceipt")
public class FundReceipt {
    @Id
    @NotNull(message = "Employee ID is required")
    @Size(min = 1, max = 50, message = "Employee ID must be between 1 and 50 characters")
    private String idNo;

    @Field("Receipt_Number")
    @NotNull(message = "Receipt Number is required")
    @Size(min = 1, max = 50, message = "Receipt Number must be between 1 and 50 characters")
    private String receiptNumber;

    @Field("Project_Number")
    @NotNull(message = "Project Number is required")
    @Size(min = 1, max = 50, message = "Project Number must be between 1 and 50 characters")
    private String projectNumber;

    @Field("Project_Name")
    @NotNull(message = "Project Name is required")
    @Size(min = 1, max = 100, message = "Project Name must be between 1 and 100 characters")
    private String projectName;

    @Field("Financial_Year")
    @NotNull(message = "Financial Year is required")
    @Size(min = 1, max = 9, message = "Financial Year must be in YYYY-YYYY format")
    private String financialYear;

    @Field("Sanction_Order_Number")
    @NotNull(message = "Sanction Order Number is required")
    @Size(min = 1, max = 50, message = "Sanction Order Number must be between 1 and 50 characters")
    private String sanctionOrderNumber;

    @Field("Sanction_Date")
    @NotNull(message = "Sanction Date is required")
    private String sanctionDate;

    @Field("Total_Amount")
    @NotNull(message = "Total Amount is required")
    private double totalAmount;

    @Field("Recurring_Amount")
    @NotNull(message = "Recurring Amount is required")
    private double recurringAmount;

    @Field("Non_Recurring_Amount")
    @NotNull(message = "Non-Recurring Amount is required")
    private double nonRecurringAmount;

    @Field("Overhead_Amount")
    @NotNull(message = "Overhead Amount is required")
    private double overheadAmount;

    @Field("Challan_Number")
    @NotNull(message = "Challan Number is required")
    @Size(min = 1, max = 50, message = "Challan Number must be between 1 and 50 characters")
    private String challanNumber;

    @Field("Challan_Date")
    @NotNull(message = "Challan Date is required")
    private String challanDate;

    @Field("Use_PFMS")
    private boolean usePFMS;

    @Field("PFMS_Scheme")
    @Size(max = 100, message = "PFMS Scheme must be at most 100 characters")
    private String pfmsScheme;

    @Field("Bank_Name")
    @Size(max = 100, message = "Bank Name must be at most 100 characters")
    private String bankName;

    @Field("Account_Number")
    @Size(max = 50, message = "Account Number must be at most 50 characters")
    private String accountNumber;

    @Field("Account_Name")
    @Size(max = 100, message = "Account Name must be at most 100 characters")
    private String accountName;
}