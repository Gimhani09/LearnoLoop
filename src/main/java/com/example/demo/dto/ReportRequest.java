package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ReportRequest {
    @NotBlank(message = "Post ID is required")
    private String postId;

    @NotBlank(message = "User ID is required")
    private String reportedByUserId;

    @NotBlank(message = "Reason is required")
    @Size(min = 5, max = 100, message = "Reason must be between 5 and 100 characters")
    private String reason;

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 500, message = "Description must be between 10 and 500 characters")
    private String description;
    
    // Default constructor required by Spring
    public ReportRequest() {
    }
    
    // Getter and setter methods in case Lombok is not working properly
    public String getPostId() {
        return postId;
    }
    
    public void setPostId(String postId) {
        this.postId = postId;
    }
    
    public String getReportedByUserId() {
        return reportedByUserId;
    }
    
    public void setReportedByUserId(String reportedByUserId) {
        this.reportedByUserId = reportedByUserId;
    }
    
    public String getReason() {
        return reason;
    }
    
    public void setReason(String reason) {
        this.reason = reason;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
}

/*report */