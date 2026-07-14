package dev.deepesh.ProjecrSubmission.Model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Data
@Document(collection = "EID")
public class Employee {
    @Id
    private String _id;

    @Field("ID No")
    @NotNull(message = "ID No is required")
    @Size(min = 1, max = 50, message = "ID No must be between 1 and 50 characters")
    private String idNo;

    @Field("Name")
    @NotNull(message = "Name is required")
    @Size(min = 1, max = 100, message = "Name must be between 1 and 100 characters")
    private String name;

    @Field("Designation")
    @NotNull(message = "Designation is required")
    @Size(min = 1, max = 100, message = "Designation must be between 1 and 100 characters")
    private String designation;

    @Field("Department")
    @NotNull(message = "Department is required")
    @Size(min = 1, max = 100, message = "Department must be between 1 and 100 characters")
    private String department;

    @Field("DoB")
    @NotNull(message = "Date of Birth is required")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private Date doB;

    @Field("DoJ")
    @NotNull(message = "Date of Joining is required")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private Date doJ;

    @Field("DoR")
    @NotNull(message = "Date of Retirement is required")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private Date doR;

    @Field("Faculty")
    @NotNull(message = "Faculty is required")
    @Size(min = 1, max = 100, message = "Faculty must be between 1 and 100 characters")
    private String faculty;

    @Field("passportNo")
    @Size(max = 50, message = "Passport number must be at most 50 characters")
    private String passportNo;

    @Field("Mobile")
    @Pattern(regexp = "^\\d{10}$", message = "Mobile number must be exactly 10 digits")
    private String mobile;

    @Field("Email")
    @Email(message = "Invalid email format")
    @Size(max = 255, message = "Email must be at most 255 characters")
    private String email;

    @Field("Project_No")
    private List<String> projectIds = new ArrayList<>();
}