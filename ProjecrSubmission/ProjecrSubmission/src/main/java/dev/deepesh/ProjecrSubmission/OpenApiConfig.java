package dev.deepesh.ProjecrSubmission;

import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public GroupedOpenApi apiGroup() {
        return GroupedOpenApi.builder()
                .group("api")
                .packagesToScan("dev.deepesh.ProjecrSubmission.Controller")
                .pathsToMatch("/api/**")
                .build();
    }
}
