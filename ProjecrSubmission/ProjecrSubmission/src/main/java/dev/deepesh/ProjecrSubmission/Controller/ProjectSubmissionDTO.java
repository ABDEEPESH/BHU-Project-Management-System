package dev.deepesh.ProjecrSubmission.Controller;

import lombok.Data;

import java.util.List;

@Data
public class ProjectSubmissionDTO {
    private String projectCode;
    private String title;
    private String fundingAgencyId;
    private Double amount;
    private String dateOfSubmission;
    private Boolean isCoPi;
    private String coPiEid;
    private String piEid;
    private String projectType;
    private Integer durationMonths;
    private List<String> employeeIds;
}