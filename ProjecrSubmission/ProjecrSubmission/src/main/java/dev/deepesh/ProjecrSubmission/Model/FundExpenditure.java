package dev.deepesh.ProjecrSubmission.Model;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.Date;

@Data
@Document(collection = "FundExpenditure")
public class FundExpenditure {
    @Id
    private String _id;

    @Field("projectCode")
    @NotNull(message = "Project code is required")
    @Size(min = 1, max = 20, message = "Project code must be between 1 and 20 characters")
    private String projectCode;

    @Field("projectTitle")
    private String projectTitle; // Auto-populated from project

    @Field("fundingAgency")
    private String fundingAgency; // Auto-populated from project

    @Field("projectNumber")
    @NotNull(message = "Project number is required")
    @Size(min = 1, max = 50, message = "Project number must be between 1 and 50 characters")
    private String projectNumber; // Roman number entered by user

    @Field("financialYear")
    @NotNull(message = "Financial year is required")
    @Size(min = 7, max = 7, message = "Financial year must be in format YYYY-YY")
    private String financialYear; // Format: 2026-27

    @Field("equipmentName")
    @NotNull(message = "Equipment name is required")
    @Size(min = 1, max = 100, message = "Equipment name must be between 1 and 100 characters")
    private String equipmentName; // Name of equipment entered by user

    @Field("equipmentPurchase")
    @NotNull(message = "Equipment purchase amount is required")
    @PositiveOrZero(message = "Equipment purchase amount must be zero or positive")
    private double equipmentPurchase; // In ₹

    @Field("salary")
    @NotNull(message = "Salary amount is required")
    @PositiveOrZero(message = "Salary amount must be zero or positive")
    private double salary; // In ₹

    @Field("contingency")
    @NotNull(message = "Contingency amount is required")
    @PositiveOrZero(message = "Contingency amount must be zero or positive")
    private double contingency; // In ₹

    @Field("overhead")
    @NotNull(message = "Overhead amount is required")
    @PositiveOrZero(message = "Overhead amount must be zero or positive")
    private double overhead; // In ₹

    @Field("totalExpenditure")
    @NotNull(message = "Total expenditure is required")
    @PositiveOrZero(message = "Total expenditure must be zero or positive")
    private double totalExpenditure; // Calculated field

    @Field("dateOfExpenditure")
    private Date dateOfExpenditure;

    @Field("timestamp")
    private Date timestamp;

    @Field("remark")
    private String remark;

    // Constructor to calculate total expenditure
    public FundExpenditure() {
        this.timestamp = new Date();
        calculateTotalExpenditure();
    }

    // Method to calculate total expenditure
    public void calculateTotalExpenditure() {
        this.totalExpenditure = this.equipmentPurchase + this.salary + this.contingency + this.overhead;
    }
}
