package dev.deepesh.ProjecrSubmission.Model;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.Date;

@Data
@Document(collection = "ProjectReceived")
public class ProjectReceived {

    @Id
    private String id;

    @Field("Timestamp")
    @NotNull(message = "Timestamp is required")
    private Date timestamp = new Date();

    @Field("Employee_ID")
    @NotNull(message = "Employee ID is required")
    @Size(min = 1, max = 50, message = "Employee ID must be between 1 and 50 characters")
    private String idNo;

    @Field("Principal_Investigator_Name")
    @NotNull(message = "Principal Investigator Name is required")
    @Size(min = 1, max = 100, message = "Principal Investigator Name must be between 1 and 100 characters")
    private String principalInvestigatorName;

    @Field("Designation")
    @Size(max = 50, message = "Designation must be at most 50 characters")
    private String designation;

    @Field("Department")
    @Size(max = 50, message = "Department must be at most 50 characters")
    private String department;

    @Field("Faculty")
    @Size(max = 50, message = "Faculty must be at most 50 characters")
    private String faculty;

    @Field("Title_of_the_Project")
    @NotNull(message = "Project Name is required")
    @Size(min = 1, max = 100, message = "Project Name must be between 1 and 100 characters")
    private String projectName;

    @Field("Project_Code")
    @Size(max = 100, message = "Project Code must be at most 100 characters")
    private String projectCode;

    @Field("Funding_Agency_ID")
    @NotNull(message = "Funding Agency ID is required")
    @Size(min = 1, max = 50, message = "Funding Agency ID must be between 1 and 50 characters")
    private String fundingAgencyId;

    @Field("Duration_Of_Project")
    @NotNull(message = "Duration of Project is required")
    @Size(max = 50, message = "Duration of Project must be at most 50 characters")
    @Pattern(regexp = "^\\d+$", message = "Duration of Project must be a positive integer")
    private String durationOfProject;

    @Field("Type_Of_Project")
    @NotNull(message = "Type of Project is required")
    @Size(max = 50, message = "Type of Project must be at most 50 characters")
    private String typeOfProject;

    @Field("Total_Project_Cost")
    @NotNull(message = "Total Project Cost is required")
    @Min(value = 0, message = "Total Project Cost cannot be negative")
    private double totalProjectCost;

    @Field("Recurring")
    @NotNull(message = "Recurring Cost is required")
    @Min(value = 0, message = "Recurring Cost cannot be negative")
    private double recurring;

    @Field("Non_Recurring")
    @NotNull(message = "Non-Recurring Cost is required")
    @Min(value = 0, message = "Non-Recurring Cost cannot be negative")
    private double nonRecurring;

    @Field("Overhead")
    @NotNull(message = "Overhead is required")
    @Min(value = 0, message = "Overhead cannot be negative")
    private double overhead;

    @Field("Date_Of_Receipt")
    @NotNull(message = "Date of Receipt is required")
    private Date dateOfReceipt;

    @Field("Financial_Year")
    @NotNull(message = "Financial Year is required")
    @Pattern(regexp = "^\\d{4}-\\d{2}$", message = "Financial Year must be in format YYYY-YY")
    private String financialYear;

    @Field("Remarks")
    @Size(max = 200, message = "Remark must be at most 200 characters")
    private String remark;
}