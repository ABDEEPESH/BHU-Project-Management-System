package dev.deepesh.ProjecrSubmission.Model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "BankDetails")
public class BankDetails {
    
    @Id
    private String id;

    @Field("Bank Name")
    private String bankName;

    // Note: In DB, "Account No" is an object with an empty-string key holding the number.
    // We keep this as a String in the model and populate it via a custom @ReadingConverter.
    private String accountNumber;

    @Field("Account Name")
    private String accountName;

    @Field("IFSC Code")
    private String ifscCode;

    @Field("Branch Name")
    private String branchName;

    @Field("Account Type")
    private String accountType;

    @Field("Is Active")
    private boolean isActive;

    public BankDetails() {}

    public BankDetails(String bankName, String accountNumber, String accountName,
                       String ifscCode, String branchName, String accountType, boolean isActive) {
        this.bankName = bankName;
        this.accountNumber = accountNumber;
        this.accountName = accountName;
        this.ifscCode = ifscCode;
        this.branchName = branchName;
        this.accountType = accountType;
        this.isActive = isActive;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getBankName() { return bankName; }
    public void setBankName(String bankName) { this.bankName = bankName; }

    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }

    public String getAccountName() { return accountName; }
    public void setAccountName(String accountName) { this.accountName = accountName; }

    public String getIfscCode() { return ifscCode; }
    public void setIfscCode(String ifscCode) { this.ifscCode = ifscCode; }

    public String getBranchName() { return branchName; }
    public void setBranchName(String branchName) { this.branchName = branchName; }

    public String getAccountType() { return accountType; }
    public void setAccountType(String accountType) { this.accountType = accountType; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    @Override
    public String toString() {
        return "BankDetails{" +
                "id='" + id + '\'' +
                ", bankName='" + bankName + '\'' +
                ", accountNumber='" + accountNumber + '\'' +
                ", accountName='" + accountName + '\'' +
                ", ifscCode='" + ifscCode + '\'' +
                ", branchName='" + branchName + '\'' +
                ", accountType='" + accountType + '\'' +
                ", isActive=" + isActive +
                '}';
    }
}
