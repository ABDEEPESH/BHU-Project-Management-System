package dev.deepesh.ProjecrSubmission.Repository;

import dev.deepesh.ProjecrSubmission.Model.ProjectReceived;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProjectReceivedRepository extends MongoRepository<ProjectReceived, String> {
    List<ProjectReceived> findByIdNo(String idNo);
}