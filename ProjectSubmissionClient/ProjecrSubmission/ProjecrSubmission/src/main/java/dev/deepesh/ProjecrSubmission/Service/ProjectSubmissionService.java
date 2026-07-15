package dev.deepesh.ProjecrSubmission.Service;

import dev.deepesh.ProjecrSubmission.Model.ProjectSubmission;
import dev.deepesh.ProjecrSubmission.Repository.ProjectSubmissionRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.validation.BindingResult;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ProjectSubmissionService {

    @Autowired
    private ProjectSubmissionRepository projectSubmissionRepository;

    public ProjectSubmission findById(String id) {
        return projectSubmissionRepository.findById(id).orElse(null);
    }

    public List<ProjectSubmission> findByProjectName(String projectName) {
        return projectSubmissionRepository.findByProjectName(projectName);
    }

    public List<ProjectSubmission> findByEmployeeId(String employeeId) {
        return projectSubmissionRepository.findByEmployee_ID(employeeId);
    }

    public List<ProjectSubmission> findByDepartment(String department) {
        return projectSubmissionRepository.findByDepartment(department);
    }

    public List<ProjectSubmission> findByFundingAgencyId(String fundingAgencyId) {
        return projectSubmissionRepository.findByFundingAgencyId(fundingAgencyId);
    }

    public List<ProjectSubmission> findAll() {
        return projectSubmissionRepository.findAll();
    }

    public Page<ProjectSubmission> findAllWithPagination(Pageable pageable) {
        return projectSubmissionRepository.findAll(pageable);
    }

    public ProjectSubmission save(@Valid ProjectSubmission submission, BindingResult bindingResult) {
        validateBindingResult(bindingResult);
        validateProjectSubmission(submission);
        submission.setTimestamp(java.time.Instant.now().toString());
        return projectSubmissionRepository.save(submission);
    }

    public ProjectSubmission update(String employeeId, @Valid ProjectSubmission submission, BindingResult bindingResult) {
        validateBindingResult(bindingResult);
        ProjectSubmission existingSubmission = findById(employeeId);
        if (existingSubmission == null) {
            throw new IllegalArgumentException("Project submission not found with Employee ID: " + employeeId);
        }
        validateProjectSubmission(submission);
        submission.setEmployee_ID(employeeId);
        submission.setTimestamp(existingSubmission.getTimestamp());
        return projectSubmissionRepository.save(submission);
    }

    public boolean deleteById(String id) {
        if (projectSubmissionRepository.existsById(id)) {
            projectSubmissionRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public Page<ProjectSubmission> searchProjectSubmissions(
            String projectName, String employeeId, String department, String faculty,
            String typeOfProject, String fundingAgencyId, Double minCost, Double maxCost,
            String startDate, String endDate, Pageable pageable) {
        
        List<ProjectSubmission> allSubmissions = findAll();
        List<ProjectSubmission> filteredSubmissions = allSubmissions.stream()
                .filter(submission -> {
                    if (projectName != null && !projectName.trim().isEmpty() && 
                        !submission.getProjectName().toLowerCase().contains(projectName.toLowerCase())) {
                        return false;
                    }
                    if (employeeId != null && !employeeId.trim().isEmpty() && 
                        !submission.getEmployee_ID().equals(employeeId)) {
                        return false;
                    }
                    if (department != null && !department.trim().isEmpty() && 
                        !submission.getDepartment().toLowerCase().contains(department.toLowerCase())) {
                        return false;
                    }
                    if (faculty != null && !faculty.trim().isEmpty() && 
                        !submission.getFaculty().toLowerCase().contains(faculty.toLowerCase())) {
                        return false;
                    }
                    if (typeOfProject != null && !typeOfProject.trim().isEmpty() && 
                        !submission.getTypeOfProject().equals(typeOfProject)) {
                        return false;
                    }
                    if (fundingAgencyId != null && !fundingAgencyId.trim().isEmpty() && 
                        !submission.getFundingAgencyId().equals(fundingAgencyId)) {
                        return false;
                    }
                    if (minCost != null && submission.getTotalProjectCost() < minCost) {
                        return false;
                    }
                    if (maxCost != null && submission.getTotalProjectCost() > maxCost) {
                        return false;
                    }
                    return true;
                })
                .collect(Collectors.toList());
        
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), filteredSubmissions.size());
        List<ProjectSubmission> pageContent = filteredSubmissions.subList(start, end);
        
        return new org.springframework.data.domain.PageImpl<>(pageContent, pageable, filteredSubmissions.size());
    }

    public Map<String, Object> getProjectSubmissionStats() {
        Map<String, Object> stats = new HashMap<>();
        
        try {
            List<ProjectSubmission> allSubmissions = findAll();
            
            if (allSubmissions.isEmpty()) {
                return getEmptyStats();
            }

            stats.put("totalSubmissions", allSubmissions.size());
            
            double totalCost = calculateTotalCost(allSubmissions);
            stats.put("totalCost", totalCost);
            stats.put("averageCost", totalCost / allSubmissions.size());
            
            stats.put("departmentCounts", getCounts(allSubmissions, ProjectSubmission::getDepartment));
            stats.put("facultyCounts", getCounts(allSubmissions, ProjectSubmission::getFaculty));
            stats.put("typeCounts", getCounts(allSubmissions, ProjectSubmission::getTypeOfProject));
            
        } catch (Exception e) {
            stats.put("error", "Error calculating statistics: " + e.getMessage());
        }
        
        return stats;
    }

    private void validateBindingResult(BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            throw new IllegalArgumentException(
                    bindingResult.getFieldErrors().stream()
                            .map(error -> error.getField() + ": " + error.getDefaultMessage())
                            .collect(Collectors.joining(", "))
            );
        }
    }

    private void validateProjectSubmission(ProjectSubmission submission) {
        validateProjectType(submission);
        validateCosts(submission);
        validateDateFormat(submission);
    }

    private void validateProjectType(ProjectSubmission submission) {
        if (submission.getTypeOfProject() != null && !Arrays.asList("Research", "Development", "Consultancy", "Training").contains(submission.getTypeOfProject())) {
            throw new IllegalArgumentException("Invalid type of project");
        }
    }

    private void validateCosts(ProjectSubmission submission) {
        validateNonNegativeCost("Total Project Cost", submission.getTotalProjectCost());
        validateNonNegativeCost("Recurring cost", submission.getRecurring());
        validateNonNegativeCost("Non-Recurring cost", submission.getNonRecurring());
        validateNonNegativeCost("Overhead", submission.getOverhead());

        Double total = submission.getTotalProjectCost();
        Double recurring = submission.getRecurring();
        Double nonRecurring = submission.getNonRecurring();
        Double overhead = submission.getOverhead();

        if (total != null && recurring != null && nonRecurring != null && overhead != null) {
            if (Math.abs(recurring + nonRecurring + overhead - total) > 0.01) {
                throw new IllegalArgumentException("Recurring + Non-Recurring + Overhead must equal Total Project Cost");
            }
        }
    }

    private void validateNonNegativeCost(String costName, Double cost) {
        if (cost == null) {
            throw new IllegalArgumentException(costName + " cannot be null");
        }
        if (cost < 0) {
            throw new IllegalArgumentException(costName + " must be a valid non-negative number");
        }
    }

    private void validateDateFormat(ProjectSubmission submission) {
        if (submission.getDateOfSubmission() != null && !submission.getDateOfSubmission().matches("\\d{4}-\\d{2}-\\d{2}")) {
            throw new IllegalArgumentException("Invalid date of submission format (YYYY-MM-DD)");
        }
    }

    // private Map<String, Object> buildSearchCriteria(String projectName, String employeeId, String department, String faculty, String typeOfProject, String fundingAgencyId) {
    //     Map<String, Object> criteria = new HashMap<>();
    //     if (projectName != null && !projectName.trim().isEmpty()) {
    //         criteria.put("projectName", projectName);
    //     }
    //     if (employeeId != null && !employeeId.trim().isEmpty()) {
    //         criteria.put("idNo", employeeId);
    //     }
    //     if (department != null && !department.trim().isEmpty()) {
    //         criteria.put("department", department);
    //     }
    //     if (faculty != null && !faculty.trim().isEmpty()) {
    //         criteria.put("faculty", faculty);
    //     }
    //     if (typeOfProject != null && !typeOfProject.trim().isEmpty()) {
    //         criteria.put("typeOfProject", typeOfProject);
    //     }
    //     if (fundingAgencyId != null && !fundingAgencyId.trim().isEmpty()) {
    //         criteria.put("fundingAgencyId", fundingAgencyId);
    //     }
    //     return criteria;
    // }

    private Map<String, Object> getEmptyStats() {
        Map<String, Object> emptyStats = new HashMap<>();
        emptyStats.put("totalSubmissions", 0);
        emptyStats.put("totalCost", 0.0);
        emptyStats.put("averageCost", 0.0);
        emptyStats.put("departmentCounts", new HashMap<>());
        emptyStats.put("facultyCounts", new HashMap<>());
        emptyStats.put("typeCounts", new HashMap<>());
        return emptyStats;
    }

    private double calculateTotalCost(List<ProjectSubmission> submissions) {
        return submissions.stream()
                .mapToDouble(ProjectSubmission::getTotalProjectCost)
                .sum();
    }

    private Map<String, Long> getCounts(List<ProjectSubmission> submissions, java.util.function.Function<ProjectSubmission, String> getter) {
        return submissions.stream()
                .filter(s -> getter.apply(s) != null)
                .collect(Collectors.groupingBy(getter, Collectors.counting()));
    }
}