package dev.deepesh.ProjecrSubmission.Security.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.HashSet;
import java.util.Set;

@Data
@Document(collection = "users")
public class UserAccount {
    @Id
    private String id;
    private String username;
    private String passwordHash;
    private Set<String> roles = new HashSet<>(); // e.g., ROLE_ADMIN, ROLE_FORM

    public boolean hasRole(String role) {
        return roles != null && roles.contains(role);
    }
}
