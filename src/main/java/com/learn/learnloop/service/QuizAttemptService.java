package com.learn.learnloop.service;

import com.learn.learnloop.dto.QuizAttemptDTO;
import com.learn.learnloop.model.Quiz;
import com.learn.learnloop.model.QuizAttempt;
import com.learn.learnloop.repository.QuizAttemptRepository;
import com.learn.learnloop.repository.QuizRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class QuizAttemptService {

    @Autowired
    private QuizAttemptRepository attemptRepository;
    
    @Autowired
    private QuizRepository quizRepository;
    
    @Autowired
    private QuizService quizService;
    
    /**
     * Start a new quiz attempt
     */
    public QuizAttempt startQuizAttempt(String quizId, String userId) {
        // Check if quiz exists and is published
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new IllegalArgumentException("Quiz not found"));
        
        if (!quiz.isPublished()) {
            throw new IllegalArgumentException("Quiz is not published");
        }
        
        // Create new attempt
        QuizAttempt attempt = new QuizAttempt();
        attempt.setQuizId(quizId);
        attempt.setUserId(userId);
        attempt.setStartedAt(LocalDateTime.now());
        attempt.setCompleted(false);
        
        return attemptRepository.save(attempt);
    }
    
    /**
     * Submit answers for a quiz attempt
     */
    public QuizAttempt submitQuizAttempt(String attemptId, List<QuizAttempt.QuestionResponse> responses) {
        // Get attempt
        QuizAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new IllegalArgumentException("Attempt not found"));
        
        // Check if already completed
        if (attempt.isCompleted()) {
            throw new IllegalArgumentException("This attempt has already been completed");
        }
        
        // Get quiz
        Quiz quiz = quizRepository.findById(attempt.getQuizId())
                .orElseThrow(() -> new IllegalArgumentException("Quiz not found"));
        
        // Calculate time spent
        LocalDateTime completionTime = LocalDateTime.now();
        int timeSpent = (int) Duration.between(attempt.getStartedAt(), completionTime).getSeconds();
        
        // Check if time limit exceeded (if there is one)
        if (quiz.getTimeLimit() > 0) {
            int timeLimit = quiz.getTimeLimit() * 60; // convert minutes to seconds
            if (timeSpent > timeLimit) {
                timeSpent = timeLimit;
            }
        }
        
        // Create map of quiz questions for easy lookup
        Map<String, Quiz.Question> questionsMap = quiz.getQuestions().stream()
                .collect(Collectors.toMap(Quiz.Question::getId, Function.identity()));
        
        // Score each response
        int correctCount = 0;
        List<QuizAttempt.QuestionResponse> scoredResponses = new ArrayList<>();
        
        for (QuizAttempt.QuestionResponse response : responses) {
            QuizAttempt.QuestionResponse scoredResponse = new QuizAttempt.QuestionResponse();
            scoredResponse.setQuestionId(response.getQuestionId());
            scoredResponse.setSelectedOptions(response.getSelectedOptions());
            
            // Get question
            Quiz.Question question = questionsMap.get(response.getQuestionId());
            if (question == null) {
                // Skip responses for questions that don't exist
                continue;
            }
            
            // Score based on question type
            if ("MULTIPLE_CHOICE".equals(question.getType())) {
                // Single choice - must match exactly
                boolean isCorrect = response.getSelectedOptions().size() == 1 && 
                                   question.getCorrectOptions().containsAll(response.getSelectedOptions());
                scoredResponse.setCorrect(isCorrect);
                if (isCorrect) correctCount++;
            } else {
                // Multiple choice - must select all correct options and no incorrect ones
                boolean isCorrect = response.getSelectedOptions().size() == question.getCorrectOptions().size() &&
                                   question.getCorrectOptions().containsAll(response.getSelectedOptions());
                scoredResponse.setCorrect(isCorrect);
                if (isCorrect) correctCount++;
            }
            
            scoredResponses.add(scoredResponse);
        }
        
        // Calculate final score
        int totalQuestions = quiz.getQuestions().size();
        int scorePercentage = totalQuestions > 0 ? (correctCount * 100) / totalQuestions : 0;
        boolean passed = scorePercentage >= quiz.getPassingScore();
        
        // Update attempt
        attempt.setResponses(scoredResponses);
        attempt.setCompletedAt(completionTime);
        attempt.setCompleted(true);
        attempt.setScore(scorePercentage);
        attempt.setPassed(passed);
        attempt.setTimeSpent(timeSpent);
        
        // Save attempt
        QuizAttempt savedAttempt = attemptRepository.save(attempt);
        
        // Update quiz statistics
        quizService.updateQuizStatistics(quiz.getId(), scorePercentage, passed);
        
        return savedAttempt;
    }
    
    /**
     * Get an attempt by ID
     */
    public Optional<QuizAttempt> getAttemptById(String attemptId) {
        return attemptRepository.findById(attemptId);
    }
    
    /**
     * Get all attempts by user
     */
    public List<QuizAttempt> getAttemptsByUser(String userId) {
        // Return completed attempts first, sorted by completion date (newest first)
        return attemptRepository.findByUserIdAndCompletedOrderByCompletedAtDesc(userId, true);
    }
    
    /**
     * Get all attempts for a quiz
     */
    public List<QuizAttempt> getAttemptsByQuiz(String quizId) {
        return attemptRepository.findByQuizId(quizId);
    }
    
    /**
     * Get all attempts by user for a specific quiz
     */
    public List<QuizAttempt> getAttemptsByUserAndQuiz(String userId, String quizId) {
        return attemptRepository.findByUserIdAndQuizId(userId, quizId);
    }
    
    /**
     * Enrich a quiz attempt DTO with question text
     */
    public QuizAttemptDTO enrichQuizAttemptDTO(QuizAttempt attempt) {
        QuizAttemptDTO dto = QuizAttemptDTO.fromAttempt(attempt);
        
        // Get quiz to fill in additional fields
        Quiz quiz = quizRepository.findById(attempt.getQuizId()).orElse(null);
        if (quiz != null) {
            dto.setQuizTitle(quiz.getTitle());
            
            // Create question map for easy lookup
            Map<String, String> questionTextMap = quiz.getQuestions().stream()
                .collect(Collectors.toMap(Quiz.Question::getId, Quiz.Question::getText));
            
            // Fill in question text for each response
            for (QuizAttemptDTO.ResponseDTO response : dto.getResponses()) {
                response.setQuestionText(questionTextMap.getOrDefault(response.getQuestionId(), ""));
            }
        }
        
        return dto;
    }
}