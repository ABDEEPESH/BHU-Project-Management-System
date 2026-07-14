package dev.deepesh.ProjecrSubmission.Model;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Data
@Document(collection = "Fundeing agencies")
public class FundingAgency {
    @Id
    private String _id;

    @Field("FA_id")
    @NotNull(message = "Funding Agency ID is required")
    @Size(min = 1, max = 50, message = "Funding Agency ID must be between 1 and 50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9-_]+$", message = "Funding Agency ID must be alphanumeric with hyphens or underscores")
    private String fundingAgencyId;

    @Field("Funding Agency Name")
    @NotNull(message = "Name is required")
    @Size(min = 1, max = 100, message = "Name must be between 1 and 100 characters")
    private String name;

    @Field("Short Name")
    @Size(max = 50, message = "Short Name must be at most 50 characters")
    private String shortName;

    @Field("Type Of Agency")
    @NotNull(message = "Type of Agency is required")
    @Size(min = 1, max = 100, message = "Type of Agency must be between 1 and 100 characters")
    private String typeOfAgency;

    @Field("Category")
    @NotNull(message = "Category is required")
    @Size(min = 1, max = 100, message = "Category must be between 1 and 100 characters")
    private String category;
}