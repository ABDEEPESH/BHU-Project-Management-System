package dev.deepesh.ProjecrSubmission.Repository;

import dev.deepesh.ProjecrSubmission.Model.FundReceipt;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FundReceiptRepository extends MongoRepository<FundReceipt, String> {
    List<FundReceipt> findByProjectNumber(String projectNumber);
    List<FundReceipt> findByIdNo(String idNo);
    Optional<FundReceipt> findByReceiptNumber(String receiptNumber);
    Optional<FundReceipt> findByChallanNumber(String challanNumber);
}