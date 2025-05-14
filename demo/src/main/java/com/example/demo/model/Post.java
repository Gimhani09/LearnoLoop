package com.example.demo.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Document(collection = "posts")
public class Post {
    @Id
    private String id;
    
    private String title;
    private String photoUrl;
    private String photoPublicId; // Added to store Cloudinary public ID
    
    // Added video support
    private String videoUrl;
    private String videoPublicId;
    
    private String description;
    private String _class;
    private int reportCount;
    private String status = "ACTIVE"; // Default status
    private String userId; // User who created the post
    
    // Added timestamps for tracking
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Added username for display purposes
    private String username;
    
    // LearnoLoop educational fields
    private String category;
    private String level;
    private Integer estimatedTime; // Reading time in minutes
    private String learningGoals;
}