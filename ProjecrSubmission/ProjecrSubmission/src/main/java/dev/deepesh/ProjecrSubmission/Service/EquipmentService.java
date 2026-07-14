package dev.deepesh.ProjecrSubmission.Service;

import dev.deepesh.ProjecrSubmission.Model.Equipment;
import dev.deepesh.ProjecrSubmission.Model.Project;
import dev.deepesh.ProjecrSubmission.Model.Employee;
import dev.deepesh.ProjecrSubmission.Repository.EquipmentRepository;
import dev.deepesh.ProjecrSubmission.Service.ProjectService;
import dev.deepesh.ProjecrSubmission.Service.EmployeeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.validation.BindingResult;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EquipmentService {

    private static final Logger logger = LoggerFactory.getLogger(EquipmentService.class);

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private ProjectService projectService;

    @Autowired
    private EmployeeService employeeService;

    public List<Equipment> findAll() {
        try {
            logger.info("Attempting to fetch all equipment from database");
            List<Equipment> equipment = equipmentRepository.findAll();
            logger.info("Successfully fetched {} equipment records from database", equipment.size());
            return equipment;
        } catch (Exception e) {
            logger.error("Failed to fetch equipment from database: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch equipment: " + e.getMessage());
        }
    }

    public Optional<Equipment> findByVoucherNumber(String voucherNumber) {
        if (voucherNumber == null || voucherNumber.trim().isEmpty()) {
            logger.warn("Voucher number is null or empty");
            throw new IllegalArgumentException("Voucher number cannot be null or empty");
        }
        try {
            logger.info("Attempting to fetch equipment with voucher number: {}", voucherNumber);
            Optional<Equipment> equipment = equipmentRepository.findByVoucherNumber(voucherNumber);
            if (equipment.isPresent()) {
                logger.info("Successfully found equipment with voucher number: {}", voucherNumber);
            } else {
                logger.warn("No equipment found with voucher number: {}", voucherNumber);
            }
            return equipment;
        } catch (Exception e) {
            logger.error("Failed to fetch equipment by voucher number {}: {}", voucherNumber, e.getMessage(), e);
            throw new RuntimeException("Failed to fetch equipment by voucher number: " + e.getMessage());
        }
    }

    public List<Equipment> findByProjectNumber(String projectNumber) {
        try {
            logger.info("Attempting to fetch equipment for project: {}", projectNumber);
            List<Equipment> equipment = equipmentRepository.findByProjectNumber(projectNumber);
            logger.info("Successfully found {} equipment records for project: {}", equipment.size(), projectNumber);
            return equipment;
        } catch (Exception e) {
            logger.error("Failed to fetch equipment by project number {}: {}", projectNumber, e.getMessage(), e);
            throw new RuntimeException("Failed to fetch equipment by project number: " + e.getMessage());
        }
    }

    public Equipment save(Equipment equipment, BindingResult bindingResult) {
        if (bindingResult != null && bindingResult.hasErrors()) {
            String errorMessage = bindingResult.getFieldErrors().stream()
                    .map(error -> error.getField() + ": " + error.getDefaultMessage())
                    .collect(Collectors.joining(", "));
            logger.error("Validation errors for equipment: {}", errorMessage);
            throw new IllegalArgumentException(errorMessage);
        }

        try {
            logger.info("Attempting to save equipment with voucher number: {}", equipment.getVoucherNumber());
            
            // Check for duplicate voucher number
            Optional<Equipment> existingEquipment = equipmentRepository.findByVoucherNumber(equipment.getVoucherNumber());
            if (existingEquipment.isPresent() && !existingEquipment.get().get_id().equals(equipment.get_id())) {
                logger.error("Equipment voucher number {} already exists", equipment.getVoucherNumber());
                throw new IllegalArgumentException("Equipment voucher number " + equipment.getVoucherNumber() + " already exists");
            }

            // Populate project title if project number is provided
            if (equipment.getProjectNumber() != null && !equipment.getProjectNumber().trim().isEmpty()) {
                Optional<Project> project = projectService.findByProjectCode(equipment.getProjectNumber());
                if (project.isPresent()) {
                    equipment.setProjectTitle(project.get().getTitle());
                    logger.info("Populated project title: {}", project.get().getTitle());
                }
            }

            Equipment savedEquipment = equipmentRepository.save(equipment);
            logger.info("Successfully saved equipment with voucher number: {}", savedEquipment.getVoucherNumber());
            return savedEquipment;
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Failed to save equipment with voucher number {}: {}", equipment.getVoucherNumber(), e.getMessage(), e);
            throw new RuntimeException("Failed to save equipment: " + e.getMessage());
        }
    }

    public long getCount() {
        try {
            logger.info("Attempting to get equipment count from database");
            long count = equipmentRepository.count();
            logger.info("Successfully retrieved equipment count: {}", count);
            return count;
        } catch (Exception e) {
            logger.error("Failed to get equipment count: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to get equipment count: " + e.getMessage());
        }
    }
}
