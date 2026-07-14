package dev.deepesh.ProjecrSubmission.Service;

import dev.deepesh.ProjecrSubmission.Model.ProjectReceived;
import dev.deepesh.ProjecrSubmission.Model.Employee;
import dev.deepesh.ProjecrSubmission.Repository.ProjectReceivedRepository;
import dev.deepesh.ProjecrSubmission.Repository.EmployeeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class ProjectReceivedService {

    private static final Logger logger = LoggerFactory.getLogger(ProjectReceivedService.class);

    @Autowired
    private ProjectReceivedRepository projectReceivedRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    public List<ProjectReceived> getAllProjectReceived() {
        try {
            List<ProjectReceived> projects = projectReceivedRepository.findAll();
            List<ProjectReceived> validProjects = new ArrayList<>();
            for (ProjectReceived project : projects) {
                try {
                    // Validate that double fields are valid
                    if (Double.isNaN(project.getTotalProjectCost()) || Double.isInfinite(project.getTotalProjectCost()) ||
                            Double.isNaN(project.getRecurring()) || Double.isInfinite(project.getRecurring()) ||
                            Double.isNaN(project.getNonRecurring()) || Double.isInfinite(project.getNonRecurring()) ||
                            Double.isNaN(project.getOverhead()) || Double.isInfinite(project.getOverhead())) {
                        logger.warn("Skipping project with invalid numeric fields: timestamp={}", project.getTimestamp());
                        continue;
                    }
                    validProjects.add(project);
                } catch (Exception e) {
                    logger.warn("Skipping invalid project: timestamp={}, error={}", project.getTimestamp(), e.getMessage());
                }
            }
            if (validProjects.isEmpty() && !projects.isEmpty()) {
                logger.warn("No valid projects found due to data issues");
            }
            return validProjects;
        } catch (Exception e) {
            logger.error("Failed to fetch project received entries: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch project received entries: " + e.getMessage());
        }
    }

    public List<ProjectReceived> getProjectReceivedByIdNo(String idNo) {
        if (idNo == null || idNo.trim().isEmpty()) {
            throw new IllegalArgumentException("Employee ID cannot be null or empty");
        }
        try {
            List<ProjectReceived> projects = projectReceivedRepository.findByIdNo(idNo);
            if (projects.isEmpty()) {
                throw new RuntimeException("No project received entries found for employee ID: " + idNo);
            }
            return projects;
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch project received by idNo: " + e.getMessage());
        }
    }

    @Transactional
    public ProjectReceived createProjectReceived(ProjectReceived projectReceived) {
        if (projectReceived == null) {
            throw new IllegalArgumentException("Project received data cannot be null");
        }

        // Validate employee ID exists
        String idNo = projectReceived.getIdNo();
        Optional<Employee> employee = employeeRepository.findByIdNo(idNo);
        if (!employee.isPresent()) {
            throw new IllegalArgumentException("Employee with ID " + idNo + " does not exist");
        }

        // Validate principal investigator name matches employee
        if (!employee.get().getName().equals(projectReceived.getPrincipalInvestigatorName())) {
            throw new IllegalArgumentException("Principal Investigator Name does not match employee record");
        }

        // Validate cost breakdown
        double totalCost = projectReceived.getTotalProjectCost();
        double recurring = projectReceived.getRecurring();
        double nonRecurring = projectReceived.getNonRecurring();
        double overhead = projectReceived.getOverhead();
        double sum = recurring + nonRecurring + overhead;
        if (Math.abs(sum - totalCost) > 0.01) {
            throw new IllegalArgumentException("Recurring + Non-Recurring + Overhead must equal Total Project Cost");
        }

        // Validate that cost fields are valid numbers
        if (Double.isNaN(totalCost) || Double.isInfinite(totalCost)) {
            throw new IllegalArgumentException("Total Project Cost must be a valid number");
        }
        if (Double.isNaN(recurring) || Double.isInfinite(recurring)) {
            throw new IllegalArgumentException("Recurring Cost must be a valid number");
        }
        if (Double.isNaN(nonRecurring) || Double.isInfinite(nonRecurring)) {
            throw new IllegalArgumentException("Non-Recurring Cost must be a valid number");
        }
        if (Double.isNaN(overhead) || Double.isInfinite(overhead)) {
            throw new IllegalArgumentException("Overhead must be a valid number");
        }

        // Validate financial year format
        if (!projectReceived.getFinancialYear().matches("^\\d{4}-\\d{2}$")) {
            throw new IllegalArgumentException("Financial Year must be in format YYYY-YY");
        }

        // Validate type of project
        String[] validTypes = {"Research", "Development", "Consultancy", "Training"};
        boolean isValidType = false;
        for (String type : validTypes) {
            if (type.equals(projectReceived.getTypeOfProject())) {
                isValidType = true;
                break;
            }
        }
        if (!isValidType) {
            throw new IllegalArgumentException("Type of Project must be one of: Research, Development, Consultancy, Training");
        }

        try {
            projectReceived.setTimestamp(new Date());
            return projectReceivedRepository.save(projectReceived);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create project received: " + e.getMessage());
        }
    }
}