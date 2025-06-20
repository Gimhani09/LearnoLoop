package com.learn.learnloop.dto;

import com.learn.learnloop.model.QuizAttempt;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
public class QuizAttemptDTO {
    private String id;
    private String userId;
    private String quizId;
    private String quizTitle; // To be filled from Quiz data
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private boolean completed;
    
    private int score; // percentage
    private boolean passed;
    private int timeSpent; // in seconds
    
    // Additional fields for progress tracking
    private int correctAnswers;
    private int incorrectAnswers;
    private String timeTaken; // Formatted time (e.g., "2m 30s")
    
    private List<ResponseDTO> responses = new ArrayList<>();
    
    @Data
    @NoArgsConstructor
    public static class ResponseDTO {
        private String questionId;
        private String questionText; // To be filled from Quiz data
        private List<String> selectedOptions = new ArrayList<>();
        private boolean correct;
    }
    
    public static QuizAttemptDTO fromAttempt(QuizAttempt attempt) {
        QuizAttemptDTO dto = new QuizAttemptDTO();
        dto.setId(attempt.getId());
        dto.setUserId(attempt.getUserId());
        dto.setQuizId(attempt.getQuizId());
        dto.setStartedAt(attempt.getStartedAt());
        dto.setCompletedAt(attempt.getCompletedAt());
        dto.setCompleted(attempt.isCompleted());
        dto.setScore(attempt.getScore());
        dto.setPassed(attempt.isPassed());
        dto.setTimeSpent(attempt.getTimeSpent());
        
        // Calculate correct and incorrect answers
        int correct = 0;
        if (attempt.getResponses() != null) {
            for (QuizAttempt.QuestionResponse response : attempt.getResponses()) {
                if (response.isCorrect()) {
                    correct++;
                }
            }
            int total = attempt.getResponses().size();
            dto.setCorrectAnswers(correct);
            dto.setIncorrectAnswers(total - correct);
        }
        
        // Format time taken
        dto.setTimeTaken(formatTime(attempt.getTimeSpent()));
        
        if (attempt.getResponses() != null) {
            dto.setResponses(attempt.getResponses().stream()
                .map(r -> {
                    ResponseDTO responseDTO = new ResponseDTO();
                    responseDTO.setQuestionId(r.getQuestionId());
                    responseDTO.setSelectedOptions(r.getSelectedOptions());
                    responseDTO.setCorrect(r.isCorrect());
                    return responseDTO;
                })
                .collect(Collectors.toList()));
        }
        
        return dto;
    }
    
    /**
     * Format seconds into a human-readable string (e.g., "2m 30s")
     */
    private static String formatTime(int seconds) {
        if (seconds < 60) {
            return seconds + "s";
        }
        
        int minutes = seconds / 60;
        int remainingSeconds = seconds % 60;
        
        if (remainingSeconds == 0) {
            return minutes + "m";
        } else {
            return minutes + "m " + remainingSeconds + "s";
        }
    }
}