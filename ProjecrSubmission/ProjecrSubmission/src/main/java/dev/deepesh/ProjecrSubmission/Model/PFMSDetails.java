package dev.deepesh.ProjecrSubmission.Model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "PFMSDetails")
public class PFMSDetails {
    
    @Id
    private String id;
    @Field("PFMS Name and Number")
    private String pfmsScheme;
    private String schemeCode;
    private String description;
    private boolean isActive;

    // Default constructor
    public PFMSDetails() {}

    // Constructor with all fields
    public PFMSDetails(String pfmsScheme, String schemeCode, String description, boolean isActive) {
        this.pfmsScheme = pfmsScheme;
        this.schemeCode = schemeCode;
        this.description = description;
        this.isActive = isActive;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getPfmsScheme() {
        return pfmsScheme;
    }

    public void setPfmsScheme(String pfmsScheme) {
        this.pfmsScheme = pfmsScheme;
    }

    public String getSchemeCode() {
        return schemeCode;
    }

    public void setSchemeCode(String schemeCode) {
        this.schemeCode = schemeCode;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    @Override
    public String toString() {
        return "PFMSDetails{" +
                "id='" + id + '\'' +
                ", pfmsScheme='" + pfmsScheme + '\'' +
                ", schemeCode='" + schemeCode + '\'' +
                ", description='" + description + '\'' +
                ", isActive=" + isActive +
                '}';
    }
}
