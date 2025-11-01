package dev.deepesh.ProjecrSubmission.Model;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.util.Date;

@Data
@Document(collection = "Equipment")
public class Equipment {
    @Id
    private String _id;

    @Field("voucherNumber")
    @NotNull(message = "Voucher number is required")
    @Size(min = 1, max = 50, message = "Voucher number must be between 1 and 50 characters")
    private String voucherNumber;

    @Field("manufactureName")
    @NotNull(message = "Manufacture name is required")
    @Size(min = 1, max = 100, message = "Manufacture name must be between 1 and 100 characters")
    private String manufactureName;

    @Field("equipmentName")
    @NotNull(message = "Equipment name is required")
    @Size(min = 1, max = 100, message = "Equipment name must be between 1 and 100 characters")
    private String equipmentName;

    @Field("caste")
    @NotNull(message = "Caste is required")
    @Size(min = 1, max = 50, message = "Caste must be between 1 and 50 characters")
    private String caste;

    @Field("date")
    @NotNull(message = "Date is required")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private Date date;

    @Field("projectNumber")
    @NotNull(message = "Project number is required")
    @Size(min = 1, max = 20, message = "Project number must be between 1 and 20 characters")
    private String projectNumber;

    @Field("projectTitle")
    private String projectTitle;

    @Field("employeeId")
    private String employeeId;

    @Field("employeeName")
    private String employeeName;
}
