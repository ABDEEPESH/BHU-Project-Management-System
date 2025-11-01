package dev.deepesh.ProjecrSubmission.Model;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Data
@Document(collection = "ProjectSubmissionDetails")
public class ProjectSubmission {
    @Id
    @NotNull(message = "Employee ID is required")
    @Size(min = 1, max = 50, message = "Employee ID must be between 1 and 50 characters")
    private String Employee_ID;

    @Field("Timestamp")
    private String timestamp; // ISO 8601 string, set by backend

    @Field("Name_Of_Principal_Investigator")
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

    @Field("Project codes")
    @Size(max = 100, message = "Project Code must be at most 100 characters")
    private String projectCode;

    @Field("Funding_Agency_Id")
    @NotNull(message = "Funding Agency ID is required")
    @Size(min = 1, max = 50, message = "Funding Agency ID must be between 1 and 50 characters")
    private String fundingAgencyId;

    @Field("Duration_Of_Project")
    @Size(max = 50, message = "Duration of Project must be at most 50 characters")
    private String durationOfProject;

    @Field("Type_Of_Project")
    @Size(max = 50, message = "Type of Project must be at most 50 characters")
    private String typeOfProject;

    @Field("Total_Project_Cost")
    @NotNull(message = "Total Project Cost is required")
    private Double totalProjectCost;

    @Field("Recurring")
    @NotNull(message = "Recurring cost is required")
    private Double recurring;

    @Field("Non_Recurring")
    @NotNull(message = "Non-Recurring cost is required")
    private Double nonRecurring;

    @Field("Overhead")
    @NotNull(message = "Overhead is required")
    private Double overhead;

    @Field("Date_Of_Submission")
    @NotNull(message = "Date of Submission is required")
    private String dateOfSubmission; // Format: YYYY-MM-DD

    @Field("Remarks")
    @Size(max = 200, message = "Remark must be at most 200 characters")
    private String remark;

    @Field("Has_Co_PI")
    private Boolean hasCoPi;

    @Field("Co_PI_Type")
    @Size(max = 10, message = "Co-PI Type must be at most 10 characters")
    private String coPiType; // "internal" or "external"

    @Field("Co_PI_IdNo")
    @Size(max = 50, message = "Co-PI Employee ID must be at most 50 characters")
    private String coPiIdNo;

    @Field("Co_PI_Name")
    @Size(max = 100, message = "Co-PI Name must be at most 100 characters")
    private String coPiName;

    @Field("Co_PI_Designation")
    @Size(max = 50, message = "Co-PI Designation must be at most 50 characters")
    private String coPiDesignation;

    @Field("Co_PI_Department")
    @Size(max = 50, message = "Co-PI Department must be at most 50 characters")
    private String coPiDepartment;

    @Field("Co_PI_Faculty")
    @Size(max = 50, message = "Co-PI Faculty must be at most 50 characters")
    private String coPiFaculty;

    @Field("Co_PI_City")
    @Size(max = 50, message = "Co-PI City must be at most 50 characters")
    private String coPiCity;

    @Field("Co_PI_State")
    @Size(max = 50, message = "Co-PI State must be at most 50 characters")
    private String coPiState;

    @Field("Co_PI_Country")
    @Size(max = 50, message = "Co-PI Country must be at most 50 characters")
    private String coPiCountry;

    // Note: Custom converters are defined in Config/MongoConfig. No converters here.
}