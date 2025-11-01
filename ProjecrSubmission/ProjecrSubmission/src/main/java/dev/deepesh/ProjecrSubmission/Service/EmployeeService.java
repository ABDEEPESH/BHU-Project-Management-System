package dev.deepesh.ProjecrSubmission.Service;

import dev.deepesh.ProjecrSubmission.Model.Employee;
import dev.deepesh.ProjecrSubmission.Repository.EmployeeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.validation.BindingResult;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EmployeeService {

    private static final Logger logger = LoggerFactory.getLogger(EmployeeService.class);

    @Autowired
    private EmployeeRepository employeeRepository;

    public List<Employee> findAll() {
        try {
            logger.info("Attempting to fetch all employees from database");
            List<Employee> employees = employeeRepository.findAll();
            logger.info("Successfully fetched {} employees from database", employees.size());
            return employees;
        } catch (Exception e) {
            logger.error("Failed to fetch employees from database: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch employees: " + e.getMessage());
        }
    }

    public Optional<Employee> findByIdNo(String idNo) {
        if (idNo == null || idNo.trim().isEmpty()) {
            logger.warn("Employee ID is null or empty");
            throw new IllegalArgumentException("Employee ID cannot be null or empty");
        }
        try {
            logger.info("Attempting to fetch employee with ID: {}", idNo);
            Optional<Employee> employee = employeeRepository.findByIdNo(idNo);
            if (employee.isPresent()) {
                logger.info("Successfully found employee with ID: {}", idNo);
            } else {
                logger.warn("No employee found with ID: {}", idNo);
            }
            return employee;
        } catch (Exception e) {
            logger.error("Failed to fetch employee by ID {}: {}", idNo, e.getMessage(), e);
            throw new RuntimeException("Failed to fetch employee by ID: " + e.getMessage());
        }
    }

    public Employee save(Employee employee, BindingResult bindingResult) {
        if (bindingResult != null && bindingResult.hasErrors()) {
            String errorMessage = bindingResult.getFieldErrors().stream()
                    .map(error -> error.getField() + ": " + error.getDefaultMessage())
                    .collect(Collectors.joining(", "));
            logger.error("Validation errors for employee: {}", errorMessage);
            throw new IllegalArgumentException(errorMessage);
        }
        try {
            logger.info("Attempting to save employee with ID: {}", employee.getIdNo());
            Optional<Employee> existingEmployee = employeeRepository.findByIdNo(employee.getIdNo());
            if (existingEmployee.isPresent() && !existingEmployee.get().get_id().equals(employee.get_id())) {
                logger.error("Employee ID {} already exists", employee.getIdNo());
                throw new IllegalArgumentException("Employee ID " + employee.getIdNo() + " already exists");
            }
            Employee savedEmployee = employeeRepository.save(employee);
            logger.info("Successfully saved employee with ID: {}", savedEmployee.getIdNo());
            return savedEmployee;
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Failed to save employee with ID {}: {}", employee.getIdNo(), e.getMessage(), e);
            throw new RuntimeException("Failed to save employee: " + e.getMessage());
        }
    }

    public long getCount() {
        try {
            logger.info("Attempting to get employee count from database");
            long count = employeeRepository.count();
            logger.info("Successfully retrieved employee count: {}", count);
            return count;
        } catch (Exception e) {
            logger.error("Failed to get employee count: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to get employee count: " + e.getMessage());
        }
    }
}