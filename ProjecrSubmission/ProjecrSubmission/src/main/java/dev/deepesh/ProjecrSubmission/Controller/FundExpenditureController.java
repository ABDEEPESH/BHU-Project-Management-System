package dev.deepesh.ProjecrSubmission.Controller;

import dev.deepesh.ProjecrSubmission.Model.FundExpenditure;
import dev.deepesh.ProjecrSubmission.Service.FundExpenditureService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/fund-expenditure")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
@Tag(name = "Fund Expenditure", description = "Fund Expenditure management APIs")
public class FundExpenditureController {

    @Autowired
    private FundExpenditureService fundExpenditureService;

    @PostMapping("/create")
    @Operation(summary = "Create a new fund expenditure", description = "Creates a new fund expenditure record")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FundExpenditure> createFundExpenditure(@Valid @RequestBody FundExpenditure fundExpenditure) {
        try {
            FundExpenditure createdExpenditure = fundExpenditureService.createFundExpenditure(fundExpenditure);
            return new ResponseEntity<>(createdExpenditure, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/all")
    @Operation(summary = "Get all fund expenditures", description = "Retrieves all fund expenditure records")
    public ResponseEntity<List<FundExpenditure>> getAllFundExpenditures() {
        try {
            List<FundExpenditure> expenditures = fundExpenditureService.getAllFundExpenditures();
            return new ResponseEntity<>(expenditures, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get fund expenditure by ID", description = "Retrieves a fund expenditure by its ID")
    public ResponseEntity<FundExpenditure> getFundExpenditureById(@PathVariable String id) {
        try {
            Optional<FundExpenditure> expenditure = fundExpenditureService.getFundExpenditureById(id);
            return expenditure.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                    .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/project/{projectCode}")
    @Operation(summary = "Get fund expenditures by project code", description = "Retrieves all fund expenditures for a specific project code")
    public ResponseEntity<List<FundExpenditure>> getFundExpendituresByProjectCode(@PathVariable String projectCode) {
        try {
            List<FundExpenditure> expenditures = fundExpenditureService.getFundExpendituresByProjectCode(projectCode);
            return new ResponseEntity<>(expenditures, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/financial-year/{financialYear}")
    @Operation(summary = "Get fund expenditures by financial year", description = "Retrieves all fund expenditures for a specific financial year")
    public ResponseEntity<List<FundExpenditure>> getFundExpendituresByFinancialYear(@PathVariable String financialYear) {
        try {
            List<FundExpenditure> expenditures = fundExpenditureService.getFundExpendituresByFinancialYear(financialYear);
            return new ResponseEntity<>(expenditures, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/project/{projectCode}/financial-year/{financialYear}")
    @Operation(summary = "Get fund expenditures by project code and financial year", description = "Retrieves fund expenditures for a specific project code and financial year")
    public ResponseEntity<List<FundExpenditure>> getFundExpendituresByProjectCodeAndFinancialYear(
            @PathVariable String projectCode, 
            @PathVariable String financialYear) {
        try {
            List<FundExpenditure> expenditures = fundExpenditureService.getFundExpendituresByProjectCodeAndFinancialYear(projectCode, financialYear);
            return new ResponseEntity<>(expenditures, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update fund expenditure", description = "Updates an existing fund expenditure record")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FundExpenditure> updateFundExpenditure(@PathVariable String id, @Valid @RequestBody FundExpenditure fundExpenditure) {
        try {
            FundExpenditure updatedExpenditure = fundExpenditureService.updateFundExpenditure(id, fundExpenditure);
            return new ResponseEntity<>(updatedExpenditure, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete fund expenditure", description = "Deletes a fund expenditure record")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteFundExpenditure(@PathVariable String id) {
        try {
            fundExpenditureService.deleteFundExpenditure(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/exists/project/{projectCode}/financial-year/{financialYear}")
    @Operation(summary = "Check if expenditure exists", description = "Checks if a fund expenditure exists for a specific project code and financial year")
    public ResponseEntity<Boolean> existsByProjectCodeAndFinancialYear(
            @PathVariable String projectCode, 
            @PathVariable String financialYear) {
        try {
            boolean exists = fundExpenditureService.existsByProjectCodeAndFinancialYear(projectCode, financialYear);
            return new ResponseEntity<>(exists, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
