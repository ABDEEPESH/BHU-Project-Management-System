package dev.deepesh.ProjecrSubmission;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@ComponentScan(basePackages = {"dev.deepesh.ProjecrSubmission"})
@EnableMongoRepositories(basePackages = {"dev.deepesh.ProjecrSubmission.Repository", "dev.deepesh.ProjecrSubmission.Security.repo"})
public class ProjectSubmissionApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProjectSubmissionApplication.class, args);
    }
}