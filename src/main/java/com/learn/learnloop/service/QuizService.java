package com.learn.learnloop.service;

import com.learn.learnloop.dto.QuizDTO;
import com.learn.learnloop.model.Quiz;
import com.learn.learnloop.model.QuizAttempt;
import com.learn.learnloop.model.User;
import com.learn.learnloop.repository.QuizAttemptRepository;
import com.learn.learnloop.repository.QuizRepository;
import com.learn.learnloop.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class QuizService {

    @Autowired
    private QuizRepository quizRepository;
    
    @Autowired
    private QuizAttemptRepository quizAttemptRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Create a new quiz
     */
    public Quiz createQuiz(Quiz quiz, String adminId) {
        // Validate if user is an admin
        User user = userRepository.findById(adminId).orElse(null);
        if (user == null || !"ADMIN".equals(user.getRole())) {
            throw new IllegalArgumentException("Only admins can create quizzes");
        }
        
        // Set metadata for new quiz
        quiz.setId(null); // Ensure MongoDB generates a new ID
        quiz.setCreatedBy(adminId);
        quiz.setCreatedAt(LocalDateTime.now());
        quiz.setUpdatedAt(LocalDateTime.now());
        quiz.setIsPublished(false); // Start as draft
        quiz.setTotalAttempts(0);
        quiz.setPassCount(0);
        quiz.setAverageScore(0.0);
        
        // Generate IDs for each question
        if (quiz.getQuestions() != null) {
            quiz.getQuestions().forEach(question -> {
                if (question.getId() == null || question.getId().isEmpty()) {
                    question.setId(UUID.randomUUID().toString());
                }
            });
        }
        
        return quizRepository.save(quiz);
    }
    
    /**
     * Update an existing quiz
     */
    public Quiz updateQuiz(String quizId, Quiz updatedQuiz, String adminId) {
        // Validate if user is an admin
        User user = userRepository.findById(adminId).orElse(null);
        if (user == null || !"ADMIN".equals(user.getRole())) {
            throw new IllegalArgumentException("Only admins can update quizzes");
        }
        
        // Check if quiz exists
        Quiz existingQuiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new IllegalArgumentException("Quiz not found"));
        
        // Only the creator or a super admin can update the quiz
        if (!existingQuiz.getCreatedBy().equals(adminId) && !"SUPER_ADMIN".equals(user.getRole())) {
            throw new IllegalArgumentException("You don't have permission to update this quiz");
        }
        
        // Update fields but preserve metadata
        updatedQuiz.setId(existingQuiz.getId());
        updatedQuiz.setCreatedBy(existingQuiz.getCreatedBy());
        updatedQuiz.setCreatedAt(existingQuiz.getCreatedAt());
        updatedQuiz.setUpdatedAt(LocalDateTime.now());
        updatedQuiz.setTotalAttempts(existingQuiz.getTotalAttempts());
        updatedQuiz.setPassCount(existingQuiz.getPassCount());
        updatedQuiz.setAverageScore(existingQuiz.getAverageScore());
        
        // Generate IDs for any new questions
        if (updatedQuiz.getQuestions() != null) {
            updatedQuiz.getQuestions().forEach(question -> {
                if (question.getId() == null || question.getId().isEmpty()) {
                    question.setId(UUID.randomUUID().toString());
                }
            });
        }
        
        return quizRepository.save(updatedQuiz);
    }
    
    /**
     * Get all quizzes (admin view)
     */
    public List<Quiz> getAllQuizzes() {
        return quizRepository.findAll();
    }
    
    /**
     * Get all quizzes by admin
     */
    public List<Quiz> getQuizzesByAdmin(String adminId) {
        return quizRepository.findByCreatedBy(adminId);
    }
    
    /**
     * Get published quizzes (user view)
     */
    public List<QuizDTO> getPublishedQuizzes() {
        return quizRepository.findByIsPublished(true)
                .stream()
                .map(quiz -> QuizDTO.fromQuiz(quiz, false)) // Don't include answers for users
                .collect(Collectors.toList());
    }
    
    /**
     * Get quiz by ID
     */
    public Optional<Quiz> getQuizById(String quizId) {
        return quizRepository.findById(quizId);
    }
    
    /**
     * Publish a quiz
     */
    public Quiz publishQuiz(String quizId, String adminId) {
        // Validate if user is an admin
        User user = userRepository.findById(adminId).orElse(null);
        if (user == null || !"ADMIN".equals(user.getRole())) {
            throw new IllegalArgumentException("Only admins can publish quizzes");
        }
        
        // Check if quiz exists
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new IllegalArgumentException("Quiz not found"));
        
        // Only the creator or a super admin can publish the quiz
        if (!quiz.getCreatedBy().equals(adminId) && !"SUPER_ADMIN".equals(user.getRole())) {
            throw new IllegalArgumentException("You don't have permission to publish this quiz");
        }
        
        // Check if quiz is valid for publishing (has questions)
        if (quiz.getQuestions() == null || quiz.getQuestions().isEmpty()) {
            throw new IllegalArgumentException("Cannot publish quiz with no questions");
        }
        
        quiz.setIsPublished(true);
        quiz.setUpdatedAt(LocalDateTime.now());
        
        return quizRepository.save(quiz);
    }
    
    /**
     * Unpublish a quiz
     */
    public Quiz unpublishQuiz(String quizId, String adminId) {
        // Validate if user is an admin
        User user = userRepository.findById(adminId).orElse(null);
        if (user == null || !"ADMIN".equals(user.getRole())) {
            throw new IllegalArgumentException("Only admins can unpublish quizzes");
        }
        
        // Check if quiz exists
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new IllegalArgumentException("Quiz not found"));
        
        // Only the creator or a super admin can unpublish the quiz
        if (!quiz.getCreatedBy().equals(adminId) && !"SUPER_ADMIN".equals(user.getRole())) {
            throw new IllegalArgumentException("You don't have permission to unpublish this quiz");
        }
        
        quiz.setIsPublished(false);
        quiz.setUpdatedAt(LocalDateTime.now());
        
        return quizRepository.save(quiz);
    }
    
    /**
     * Delete a quiz
     */
    public void deleteQuiz(String quizId, String adminId) {
        // Validate if user is an admin
        User user = userRepository.findById(adminId).orElse(null);
        if (user == null || !"ADMIN".equals(user.getRole())) {
            throw new IllegalArgumentException("Only admins can delete quizzes");
        }
        
        // Check if quiz exists
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new IllegalArgumentException("Quiz not found"));
        
        // Only the creator or a super admin can delete the quiz
        if (!quiz.getCreatedBy().equals(adminId) && !"SUPER_ADMIN".equals(user.getRole())) {
            throw new IllegalArgumentException("You don't have permission to delete this quiz");
        }
        
        // Delete all attempts for this quiz as well
        List<QuizAttempt> attempts = quizAttemptRepository.findByQuizId(quizId);
        if (!attempts.isEmpty()) {
            quizAttemptRepository.deleteAll(attempts);
        }
        
        // Delete the quiz
        quizRepository.deleteById(quizId);
    }
    
    /**
     * Update quiz statistics after a new attempt
     */
    public void updateQuizStatistics(String quizId, int score, boolean passed) {
        Quiz quiz = quizRepository.findById(quizId).orElse(null);
        if (quiz == null) return;
        
        int totalAttempts = quiz.getTotalAttempts() + 1;
        int passCount = quiz.getPassCount() + (passed ? 1 : 0);
        
        // Calculate new average score
        double currentTotalScore = quiz.getAverageScore() * quiz.getTotalAttempts();
        double newAverageScore = (currentTotalScore + score) / totalAttempts;
        
        quiz.setTotalAttempts(totalAttempts);
        quiz.setPassCount(passCount);
        quiz.setAverageScore(newAverageScore);
        
        quizRepository.save(quiz);
    }
}