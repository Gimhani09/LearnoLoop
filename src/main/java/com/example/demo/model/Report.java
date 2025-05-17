package com.example.demo.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Document(collection = "reports")
public class Report {
    @Id
    private String id;
    private String postId;
    private String reportedByUserId;
    private String reason;
    private String description;
    private LocalDateTime reportedAt;
    private String status; // PENDING, APPROVED, REJECTED
    private String adminComment;
    private LocalDateTime reviewedAt;
    private String reviewedByAdminId;
} 