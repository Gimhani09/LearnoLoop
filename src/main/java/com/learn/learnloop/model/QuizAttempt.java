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
@Document(collection = "quiz_attempts")
public class QuizAttempt {
    
    @Id
    private String id;
    
    private String userId;
    private String quizId;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private boolean completed;
    
    private int score; // percentage
    private boolean passed;
    private int timeSpent; // in seconds
    
    // Additional fields for BadgeService
    private String category; // Quiz category for tracking subject expertise
    
    private List<QuestionResponse> responses = new ArrayList<>();
    
    // Getter and setter for timeSpent
    public int getTimeSpent() {
        return this.timeSpent;
    }
    
    public void setTimeSpent(int timeSpent) {
        this.timeSpent = timeSpent;
    }
    
    // Compatibility methods for timeTaken that map to timeSpent
    public int getTimeTaken() {
        return this.timeSpent;
    }
    
    public void setTimeTaken(int timeTaken) {
        this.timeSpent = timeTaken;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionResponse {
        private String questionId;
        private List<String> selectedOptions = new ArrayList<>(); // indices of selected options
        private boolean correct;
    }
}