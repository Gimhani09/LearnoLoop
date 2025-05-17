package com.example.demo.dto;

import com.example.demo.model.Quiz;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
public class QuizDTO {
    private String id;
    private String title;
    private String description;
    private String category;
    private int timeLimit;
    private int passingScore;
    private boolean isPublished;
    
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    private List<QuestionDTO> questions = new ArrayList<>();
    
    // Statistics (for admin view)
    private int totalAttempts;
    private int passCount;
    private double averageScore;
    
    // Explicitly add getter and setter for isPublished to avoid conflicts
    public boolean isPublished() {
        return isPublished;
    }
    
    public void setPublished(boolean isPublished) {
        this.isPublished = isPublished;
    }
    
    public void setIsPublished(boolean isPublished) {
        this.isPublished = isPublished;
    }
    
    public boolean getIsPublished() {
        return isPublished;
    }
    
    @Data
    @NoArgsConstructor
    public static class QuestionDTO {
        private String id;
        private String text;
        private String type;
        private List<String> options = new ArrayList<>();
        private List<String> correctOptions = new ArrayList<>(); // Only included for admin or after quiz completion
    }
    
    public static QuizDTO fromQuiz(Quiz quiz, boolean includeAnswers) {
        QuizDTO dto = new QuizDTO();
        dto.setId(quiz.getId());
        dto.setTitle(quiz.getTitle());
        dto.setDescription(quiz.getDescription());
        dto.setCategory(quiz.getCategory());
        dto.setTimeLimit(quiz.getTimeLimit());
        dto.setPassingScore(quiz.getPassingScore());
        dto.setIsPublished(quiz.isPublished());
        dto.setCreatedBy(quiz.getCreatedBy());
        dto.setCreatedAt(quiz.getCreatedAt());
        dto.setUpdatedAt(quiz.getUpdatedAt());
        dto.setTotalAttempts(quiz.getTotalAttempts());
        dto.setPassCount(quiz.getPassCount());
        dto.setAverageScore(quiz.getAverageScore());
        
        if (quiz.getQuestions() != null) {
            dto.setQuestions(quiz.getQuestions().stream()
                .map(q -> {
                    QuestionDTO questionDTO = new QuestionDTO();
                    questionDTO.setId(q.getId());
                    questionDTO.setText(q.getText());
                    questionDTO.setType(q.getType());
                    questionDTO.setOptions(q.getOptions());
                    
                    // Only include correct answers for admins or after completion
                    if (includeAnswers) {
                        questionDTO.setCorrectOptions(q.getCorrectOptions());
                    }
                    
                    return questionDTO;
                })
                .collect(Collectors.toList()));
        }
        
        return dto;
    }
}