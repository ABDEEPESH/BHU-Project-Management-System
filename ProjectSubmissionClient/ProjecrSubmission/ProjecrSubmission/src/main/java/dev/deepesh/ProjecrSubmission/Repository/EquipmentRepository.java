package dev.deepesh.ProjecrSubmission.Repository;

import dev.deepesh.ProjecrSubmission.Model.Equipment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface EquipmentRepository extends MongoRepository<Equipment, String> {
    @Query("{'voucherNumber': ?0}")
    Optional<Equipment> findByVoucherNumber(String voucherNumber);
    
    @Query("{'projectNumber': ?0}")
    List<Equipment> findByProjectNumber(String projectNumber);
    
    @Query("{'employeeId': ?0}")
    List<Equipment> findByEmployeeId(String employeeId);
}
