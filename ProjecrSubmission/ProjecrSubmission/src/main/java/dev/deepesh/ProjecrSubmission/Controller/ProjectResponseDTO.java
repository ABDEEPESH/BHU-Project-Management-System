package dev.deepesh.ProjecrSubmission.Controller;

import lombok.Data;

import java.util.List;

@Data
public class ProjectResponseDTO {
    private String id;
    private String projectCode;
    private String title;
    private String fundingAgencyId; // Changed from fundingAgencyName to match frontend
    private double amount;
    private String dateOfSubmission;
    private Boolean isCoPi;
    private List<String> coPiEid; // Changed from int to List<String>
    private String piEid; // Changed from int to String
    private String projectType;
    private int durationMonths;
    private List<String> employeeIds; // Replaced employees with employeeIds

    // No need for setEmployeeIds method since it's handled by Lombok @Data
}