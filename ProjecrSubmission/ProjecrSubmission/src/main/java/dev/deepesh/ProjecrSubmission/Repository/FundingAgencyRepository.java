package dev.deepesh.ProjecrSubmission.Repository;

import dev.deepesh.ProjecrSubmission.Model.FundingAgency;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FundingAgencyRepository extends MongoRepository<FundingAgency, String> {
    Optional<FundingAgency> findByFundingAgencyId(String fundingAgencyId);
    Optional<FundingAgency> findByName(String name);
}