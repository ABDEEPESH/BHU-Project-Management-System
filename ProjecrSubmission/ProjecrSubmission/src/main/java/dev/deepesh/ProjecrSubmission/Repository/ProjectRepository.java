package dev.deepesh.ProjecrSubmission.Repository;

import dev.deepesh.ProjecrSubmission.Model.Project;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProjectRepository extends MongoRepository<Project, String> {
    Optional<Project> findByProjectCode(String projectCode);
    Optional<Project> findByTitle(String title);
}