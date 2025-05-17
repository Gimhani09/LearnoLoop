package com.example.demo.controller;

import com.example.demo.dto.QuizAttemptDTO;
import com.example.demo.model.QuizAttempt;
import com.example.demo.model.User;
import com.example.demo.service.QuizAttemptService;
import com.example.demo.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/quiz-attempts")
@CrossOrigin(origins = "${app.cors.allowed-origins}", allowCredentials = "true")
public class QuizAttemptController {

    @Autowired
    private QuizAttemptService attemptService;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Start a quiz attempt
     */
    @PostMapping("/start")
    public ResponseEntity<?> startQuizAttempt(@RequestBody Map<String, String> payload, Authentication auth) {
        try {
            String quizId = payload.get("quizId");
            if (quizId == null || quizId.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Quiz ID is required"));
            }
            
            User user = getUserFromAuth(auth);
            QuizAttempt attempt = attemptService.startQuizAttempt(quizId, user.getId());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "attemptId", attempt.getId(),
                "message", "Quiz attempt started successfully"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Submit a quiz attempt
     */
    @PostMapping("/{attemptId}/submit")
    public ResponseEntity<?> submitQuizAttempt(
            @PathVariable String attemptId,
            @RequestBody List<QuizAttempt.QuestionResponse> responses,
            Authentication auth) {
        try {
            User user = getUserFromAuth(auth);
            
            // Verify this attempt belongs to the current user
            QuizAttempt attempt = attemptService.getAttemptById(attemptId)
                .orElseThrow(() -> new IllegalArgumentException("Attempt not found"));
            
            if (!attempt.getUserId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You can only submit your own attempts"));
            }
            
            QuizAttempt submittedAttempt = attemptService.submitQuizAttempt(attemptId, responses);
            QuizAttemptDTO enrichedAttempt = attemptService.enrichQuizAttemptDTO(submittedAttempt);
            
            // Log the enriched attempt for debugging
            System.out.println("Enriched attempt: " + enrichedAttempt);
            
            return ResponseEntity.ok(enrichedAttempt);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace(); // Enhanced logging for troubleshooting
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get attempts by current user
     */
    @GetMapping("/me")
    public ResponseEntity<?> getMyAttempts(Authentication auth) {
        try {
            User user = getUserFromAuth(auth);
            List<QuizAttempt> attempts = attemptService.getAttemptsByUser(user.getId());
            
            List<QuizAttemptDTO> enrichedAttempts = attempts.stream()
                .map(attempt -> attemptService.enrichQuizAttemptDTO(attempt))
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(enrichedAttempts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get attempts for a specific quiz by current user
     */
    @GetMapping("/me/quiz/{quizId}")
    public ResponseEntity<?> getMyAttemptsByQuiz(@PathVariable String quizId, Authentication auth) {
        try {
            User user = getUserFromAuth(auth);
            List<QuizAttempt> attempts = attemptService.getAttemptsByUserAndQuiz(user.getId(), quizId);
            
            List<QuizAttemptDTO> enrichedAttempts = attempts.stream()
                .map(attempt -> attemptService.enrichQuizAttemptDTO(attempt))
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(enrichedAttempts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get a specific attempt
     */
    @GetMapping("/{attemptId}")
    public ResponseEntity<?> getAttemptById(@PathVariable String attemptId, Authentication auth) {
        try {
            QuizAttempt attempt = attemptService.getAttemptById(attemptId)
                .orElseThrow(() -> new IllegalArgumentException("Attempt not found"));
            
            User user = getUserFromAuth(auth);
            boolean isAdmin = "ADMIN".equals(user.getRole());
            
            // Only the user who made the attempt or an admin can view it
            if (!attempt.getUserId().equals(user.getId()) && !isAdmin) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You can only view your own attempts"));
            }
            
            QuizAttemptDTO enrichedAttempt = attemptService.enrichQuizAttemptDTO(attempt);
            return ResponseEntity.ok(enrichedAttempt);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Admin: Get all attempts for a quiz
     */
    @GetMapping("/admin/quiz/{quizId}")
    public ResponseEntity<?> getAttemptsByQuiz(@PathVariable String quizId, Authentication auth) {
        try {
            // Verify user is admin
            User user = getUserFromAuth(auth);
            if (!"ADMIN".equals(user.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only admins can access this endpoint"));
            }
            
            List<QuizAttempt> attempts = attemptService.getAttemptsByQuiz(quizId);
            
            List<QuizAttemptDTO> enrichedAttempts = attempts.stream()
                .map(attempt -> attemptService.enrichQuizAttemptDTO(attempt))
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(enrichedAttempts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Helper method to get User from Authentication
     */
    private User getUserFromAuth(Authentication auth) {
        if (auth == null) {
            throw new IllegalArgumentException("Authentication required");
        }
        
        String username = auth.getName();
        User user = userRepository.findByUsername(username);
        
        if (user == null) {
            throw new IllegalArgumentException("User not found");
        }
        
        return user;
    }
}