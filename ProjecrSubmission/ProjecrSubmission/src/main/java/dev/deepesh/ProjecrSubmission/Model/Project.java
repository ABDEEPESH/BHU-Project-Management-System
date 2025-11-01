package dev.deepesh.ProjecrSubmission.Model;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.Date;

@Data
@Document(collection = "Project")
public class Project {
    @Id
    private String _id;

    @Field("projectCode")
    @NotNull(message = "Project code is required")
    @Size(min = 1, max = 20, message = "Project code must be between 1 and 20 characters")
    private String projectCode;

    @Field("title")
    @NotNull(message = "Title is required")
    @Size(min = 1, max = 100, message = "Title must be between 1 and 100 characters")
    private String title;

    @Field("funding_agency_id")
    @NotNull(message = "Funding Agency Id is required")
    @Size(min = 1, max = 20, message = "Funding Agency Id must be between 1 and 20 characters")
    private String fundingAgencyId;

    @Field("amount")
    @NotNull(message = "Amount is required")
    @PositiveOrZero
    private double amount;

    @Field("date_of_submission")
    private Date dateOfSubmission;

    @Field("is_co_pi")
    @NotNull(message = "IsCoPi is required is required")
    private Boolean isCoPi;

    @Field("co_pi_eid")
    private String coPiEid;

    @Field("pi_eid")
    @NotNull(message = "PiEid is required")
    private String piEid;

    @Field("project_type")
    @NotNull(message = "Project Type is required")
    @Size(min = 1, max = 5, message = "Funding Agency Id must be either MAJOR or MINOR")
    private String projectType; // "MAJOR" or "MINOR"

    @Field("duration_months")
    private int durationMonths;
}   