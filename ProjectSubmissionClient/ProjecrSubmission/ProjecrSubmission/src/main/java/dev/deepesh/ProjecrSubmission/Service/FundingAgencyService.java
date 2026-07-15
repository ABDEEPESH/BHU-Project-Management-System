package dev.deepesh.ProjecrSubmission.Service;

import dev.deepesh.ProjecrSubmission.Model.FundingAgency;
import dev.deepesh.ProjecrSubmission.Repository.FundingAgencyRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.validation.BindingResult;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FundingAgencyService {
    @Autowired
    private FundingAgencyRepository fundingAgencyRepository;

    public Optional<FundingAgency> findByFundingAgencyId(String fundingAgencyId) {
        return fundingAgencyRepository.findByFundingAgencyId(fundingAgencyId);
    }

    public Optional<FundingAgency> findByFundingAgencyName(String name) {
        return fundingAgencyRepository.findByName(name);
    }

    public List<FundingAgency> findAll() {
        return fundingAgencyRepository.findAll();
    }

    public FundingAgency save(@Valid FundingAgency fundingAgency, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            throw new IllegalArgumentException(
                    bindingResult.getFieldErrors().stream()
                            .map(error -> error.getField() + ": " + error.getDefaultMessage())
                            .collect(Collectors.joining(", "))
            );
        }
        if (fundingAgency.getFundingAgencyId() != null && fundingAgencyRepository.findByFundingAgencyId(fundingAgency.getFundingAgencyId()).isPresent()) {
            throw new IllegalArgumentException("Funding Agency with ID " + fundingAgency.getFundingAgencyId() + " already exists");
        }
        // Optional: Check for name uniqueness
        if (fundingAgency.getName() != null && !fundingAgency.getName().isEmpty() &&
                fundingAgencyRepository.findByName(fundingAgency.getName()).isPresent()) {
            throw new IllegalArgumentException("Funding Agency with name " + fundingAgency.getName() + " already exists");
        }
        return fundingAgencyRepository.save(fundingAgency);
    }
}