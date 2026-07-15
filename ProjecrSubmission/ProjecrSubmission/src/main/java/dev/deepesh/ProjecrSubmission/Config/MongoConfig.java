package dev.deepesh.ProjecrSubmission.Config;

import org.bson.Document;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.convert.ReadingConverter;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;
import org.springframework.context.annotation.Bean;

import java.util.Arrays;

import dev.deepesh.ProjecrSubmission.Model.ProjectSubmission;
import dev.deepesh.ProjecrSubmission.Model.BankDetails;

@Configuration
public class MongoConfig {

    @Bean
    @SuppressWarnings("unchecked")
    public MongoCustomConversions mongoCustomConversions() {
        return new MongoCustomConversions(Arrays.asList(
            new StringToDoubleConverter(),
            new ObjectToDoubleConverter(),
            new DocumentToProjectSubmissionConverter(),
            new DocumentToBankDetailsConverter()
        ));
    }

    @ReadingConverter
    public static class StringToDoubleConverter implements org.springframework.core.convert.converter.Converter<String, Double> {
        @Override
        public Double convert(@org.eclipse.jdt.annotation.NonNull String source) {
            if (source == null || source.trim().isEmpty()) {
                return 0.0;
            }
            try {
                return Double.parseDouble(source);
            } catch (NumberFormatException e) {
                return 0.0;
            }
        }
    }

    @ReadingConverter
    public static class ObjectToDoubleConverter implements org.springframework.core.convert.converter.Converter<Object, Double> {
        @Override
        public Double convert(@org.eclipse.jdt.annotation.NonNull Object source) {
            if (source == null) {
                return 0.0;
            }
            if (source instanceof Number) {
                return ((Number) source).doubleValue();
            }
            if (source instanceof String) {
                String strSource = (String) source;
                if (strSource.trim().isEmpty()) {
                    return 0.0;
                }
                try {
                    return Double.parseDouble(strSource);
                } catch (NumberFormatException e) {
                    return 0.0;
                }
            }
            return 0.0;
        }
    }

    @ReadingConverter
    public static class DocumentToProjectSubmissionConverter implements org.springframework.core.convert.converter.Converter<Document, ProjectSubmission> {
        @Override
        public ProjectSubmission convert(@org.eclipse.jdt.annotation.NonNull Document source) {
            ProjectSubmission ps = new ProjectSubmission();

            Object empObj = source.get("Emp");
            if (empObj instanceof Document empDoc) {
                Object empId = empDoc.get(" ID");
                if (empId != null) {
                    ps.setEmployee_ID(String.valueOf(empId));
                }
            }

            ps.setTimestamp(source.getString("Timestamp"));
            ps.setPrincipalInvestigatorName(source.getString("Name of Principal Investigator"));
            ps.setDesignation(source.getString("Designation"));
            ps.setDepartment(source.getString("Department"));
            ps.setFaculty(source.getString("Faculty"));
            ps.setProjectName(source.getString("Title of the Project"));
            ps.setFundingAgencyId(source.getString("Funding Agency"));
            ps.setDurationOfProject(source.getString("Duration of Project"));
            ps.setTypeOfProject(source.getString("Type of Project"));
            ps.setDateOfSubmission(source.getString("Date of Submission"));
            ps.setRemark(source.getString("Remarks"));

            String projCode = source.getString("Project codes");
            if (projCode != null) {
                ps.setProjectCode(projCode);
            }

            ps.setTotalProjectCost(parseDouble(source.get("Total Project Cost")));
            ps.setOverhead(parseDouble(source.get("Overhead")));
            ps.setRecurring(parseDouble(source.get("Recurring")));
            ps.setNonRecurring(parseDouble(source.get("Non Recurring")));

            return ps;
        }

        private Double parseDouble(Object val) {
            if (val == null) return 0.0;
            if (val instanceof Number) return ((Number) val).doubleValue();
            try {
                return Double.parseDouble(String.valueOf(val));
            } catch (Exception e) {
                return 0.0;
            }
        }
    }

    @ReadingConverter
    public static class DocumentToBankDetailsConverter implements org.springframework.core.convert.converter.Converter<Document, BankDetails> {
        @Override
        public BankDetails convert(@org.eclipse.jdt.annotation.NonNull Document source) {
            BankDetails bd = new BankDetails();

            String bankName = getAny(source, "Bank Name", "bankName");
            String accountName = getAny(source, "Account Name", "accountName");

            Object accObj = getObj(source, "Account No", "accountNo", "Account_Number", "accountNumber");
            String accountNumber = extractAccountNumber(accObj);

            bd.setBankName(bankName != null ? bankName : "");
            bd.setAccountName(accountName != null ? accountName : "");
            bd.setAccountNumber(accountNumber != null ? accountNumber : "");

            bd.setIfscCode(getAny(source, "IFSC Code", "ifscCode"));
            bd.setBranchName(getAny(source, "Branch Name", "branchName"));
            bd.setAccountType(getAny(source, "Account Type", "accountType"));

            Object active = getObj(source, "Is Active", "isActive");
            bd.setActive(active instanceof Boolean ? (Boolean) active : true);

            return bd;
        }

        private String getAny(Document d, String... keys) {
            for (String k : keys) {
                Object v = d.get(k);
                if (v instanceof String s && !s.isEmpty()) return s;
            }
            for (String k : d.keySet()) {
                String norm = k.replace(" ", "").toLowerCase();
                for (String want : keys) {
                    if (norm.equals(want.replace(" ", "").toLowerCase())) {
                        Object v = d.get(k);
                        if (v != null) return String.valueOf(v);
                    }
                }
            }
            return null;
        }

        private Object getObj(Document d, String... keys) {
            for (String k : keys) {
                if (d.containsKey(k)) return d.get(k);
            }
            return null;
        }

        private String extractAccountNumber(Object accObj) {
            if (accObj == null) return null;
            if (accObj instanceof Document doc) {
                Object v = doc.get("");
                if (v == null) v = doc.get("value");
                if (v == null) v = doc.get("number");
                if (v == null) v = doc.values().stream().filter(x -> x instanceof Number || (x instanceof String s && s.matches("\\d+"))).findFirst().orElse(null);
                return v != null ? String.valueOf(v) : null;
            }
            return String.valueOf(accObj);
        }
    }
}
