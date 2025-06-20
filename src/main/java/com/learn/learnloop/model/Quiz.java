package com.learn.learnloop.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "quizzes")
public class Quiz {
    
    @Id
    private String id;
    
    private String title;
    private String description;
    private String category;
    private int timeLimit; // in minutes, 0 means no limit
    private int passingScore; // percentage
    private boolean isPublished;
    
    private String createdBy; // user ID of admin who created this quiz
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    private List<Question> questions = new ArrayList<>();
    
    // Statistics
    private int totalAttempts;
    private int passCount;
    private double averageScore;
    
    // Explicitly add getter and setter for isPublished to avoid naming conflicts
    public boolean isPublished() {
        return isPublished;
    }
    
    public void setPublished(boolean isPublished) {
        this.isPublished = isPublished;
    }
    
    // For compatibility with existing code
    public void setIsPublished(boolean isPublished) {
        this.isPublished = isPublished;
    }
    
    // Additional getter to ensure proper serialization
    public boolean getIsPublished() {
        return isPublished;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Question {
        private String id;
        private String text;
        private String type; // MULTIPLE_CHOICE or MULTIPLE_ANSWER
        private List<String> options = new ArrayList<>();
        private List<String> correctOptions = new ArrayList<>(); // indices of correct options stored as strings
    }
}