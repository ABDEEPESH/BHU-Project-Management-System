package dev.deepesh.ProjecrSubmission.Service;

import dev.deepesh.ProjecrSubmission.Model.Project;
import dev.deepesh.ProjecrSubmission.Repository.EmployeeRepository;
import dev.deepesh.ProjecrSubmission.Repository.FundingAgencyRepository;
import dev.deepesh.ProjecrSubmission.Repository.ProjectRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.validation.BindingResult;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProjectService {
    @Autowired
    private ProjectRepository projectRepository;
    @Autowired
    private EmployeeRepository employeeRepository;
    @Autowired
    private FundingAgencyRepository fundingAgencyRepository;

    public Optional<Project> findByProjectCode(String projectCode) {
        return projectRepository.findByProjectCode(projectCode);
    }

    public Optional<Project> findByProjectName(String projectName) {
        return projectRepository.findByTitle(projectName);
    }

    public List<Project> findAll() {
        return projectRepository.findAll();
    }

    public Project save(@Valid Project project, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            throw new IllegalArgumentException(
                    bindingResult.getFieldErrors().stream()
                            .map(error -> error.getField() + ": " + error.getDefaultMessage())
                            .collect(Collectors.joining(", "))
            );
        }
        if (employeeRepository.findByIdNo(String.valueOf(project.getPiEid())).isEmpty()) {
            throw new IllegalArgumentException("Employee with ID No " + project.getPiEid() + " does not exist, hence cannot be inserted as PI EID!");
        }
        if (project.getIsCoPi() && employeeRepository.findByIdNo(String.valueOf(project.getCoPiEid())).isEmpty()) {
            throw new IllegalArgumentException("Employee with ID No " + project.getCoPiEid() + " does not exist, hence cannot be inserted as Co Pi EID!");
        }
        if (fundingAgencyRepository.findByFundingAgencyId(project.getFundingAgencyId()).isEmpty()) {
            throw new IllegalArgumentException("Funding Agency ID " + project.getFundingAgencyId() + " does not exist!");
        }

        return projectRepository.save(project);
    }
}
