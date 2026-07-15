package dev.deepesh.ProjecrSubmission.Repository;

import dev.deepesh.ProjecrSubmission.Model.ProjectSubmission;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectSubmissionRepository extends MongoRepository<ProjectSubmission, String> {
    
    // DB uses key: "Title of the Project"
    @Query("{'Title of the Project': ?0}")
    List<ProjectSubmission> findByProjectName(String projectName);
    
    // Employee ID is stored under nested path Emp." ID" (note the space before ID)
    @Query("{'Emp. ID': ?0}")
    List<ProjectSubmission> findByEmployee_ID(String employee_ID);
    
    // DB uses key: "Department"
    @Query("{'Department': ?0}")
    List<ProjectSubmission> findByDepartment(String department);
    
    // DB uses key: "Funding Agency"
    @Query("{'Funding Agency': ?0}")
    List<ProjectSubmission> findByFundingAgencyId(String fundingAgencyId);
}