package com.example.demo.controller;

import com.example.demo.dto.QuizDTO;
import com.example.demo.model.Quiz;
import com.example.demo.model.User;
import com.example.demo.service.QuizService;
import com.example.demo.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/quizzes")
@CrossOrigin(origins = "${app.cors.allowed-origins}", allowCredentials = "true")
public class QuizController {

    @Autowired
    private QuizService quizService;
    
    @Autowired
    private UserRepository userRepository;
    
    // List of valid categories
    private static final List<String> VALID_CATEGORIES = Arrays.asList(
        "General Knowledge", "Programming", "Mathematics", "Science", 
        "Language", "History", "Art", "Business", "Data Science"
    );
    
    /**
     * Get all quizzes (default endpoint)
     */
    @GetMapping
    public ResponseEntity<?> getQuizzes(Authentication auth) {
        try {
            // If the user is an admin, show all quizzes with correct answers
            if (auth != null) {
                try {
                    User user = getUserFromAuth(auth);
                    if ("ADMIN".equals(user.getRole())) {
                        List<Quiz> quizzes = quizService.getAllQuizzes();
                        return ResponseEntity.ok(quizzes.stream()
                            .map(quiz -> QuizDTO.fromQuiz(quiz, true))
                            .collect(Collectors.toList()));
                    }
                } catch (Exception e) {
                    // If auth check fails, fall back to showing only published quizzes
                }
            }
            
            // For non-admin users or unauthenticated users, show only published quizzes
            List<QuizDTO> quizzes = quizService.getPublishedQuizzes();
            return ResponseEntity.ok(quizzes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get all quizzes (admin only)
     */
    @GetMapping("/admin")
    public ResponseEntity<?> getAllQuizzes(Authentication auth) {
        try {
            // Check if user is admin
            User user = getUserFromAuth(auth);
            if (!"ADMIN".equals(user.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only admins can access this endpoint"));
            }
            
            List<Quiz> quizzes = quizService.getAllQuizzes();
            return ResponseEntity.ok(quizzes.stream()
                .map(quiz -> QuizDTO.fromQuiz(quiz, true))
                .collect(Collectors.toList()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get quizzes created by current admin
     */
    @GetMapping("/admin/mine")
    public ResponseEntity<?> getMyQuizzes(Authentication auth) {
        try {
            // Check if user is admin
            User user = getUserFromAuth(auth);
            if (!"ADMIN".equals(user.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only admins can access this endpoint"));
            }
            
            List<Quiz> quizzes = quizService.getQuizzesByAdmin(user.getId());
            return ResponseEntity.ok(quizzes.stream()
                .map(quiz -> QuizDTO.fromQuiz(quiz, true))
                .collect(Collectors.toList()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get published quizzes (for all users)
     */
    @GetMapping("/public")
    public ResponseEntity<?> getPublishedQuizzes() {
        try {
            List<QuizDTO> quizzes = quizService.getPublishedQuizzes();
            return ResponseEntity.ok(quizzes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get quiz by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getQuizById(@PathVariable String id, Authentication auth) {
        try {
            Optional<Quiz> quizOpt = quizService.getQuizById(id);
            
            if (quizOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Quiz not found"));
            }
            
            Quiz quiz = quizOpt.get();
            
            // Determine if answers should be included
            boolean includeAnswers = false;
            if (auth != null) {
                User user = getUserFromAuth(auth);
                // Include answers if user is admin
                includeAnswers = "ADMIN".equals(user.getRole());
            }
            
            // If quiz is not published, only admins can see it
            if (!quiz.isPublished() && (auth == null || !includeAnswers)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Quiz not available"));
            }
            
            QuizDTO quizDTO = QuizDTO.fromQuiz(quiz, includeAnswers);
            return ResponseEntity.ok(quizDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Create a new quiz (admin only)
     */
    @PostMapping
    public ResponseEntity<?> createQuiz(@RequestBody Quiz quiz, Authentication auth) {
        try {
            User user = getUserFromAuth(auth);
            if (!"ADMIN".equals(user.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only admins can create quizzes"));
            }
            
            // Validate category
            if (!VALID_CATEGORIES.contains(quiz.getCategory())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid category. Valid categories are: " + String.join(", ", VALID_CATEGORIES)));
            }
            
            Quiz createdQuiz = quizService.createQuiz(quiz, user.getId());
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(QuizDTO.fromQuiz(createdQuiz, true));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Update a quiz (admin only)
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateQuiz(@PathVariable String id, @RequestBody Quiz quiz, Authentication auth) {
        try {
            User user = getUserFromAuth(auth);
            if (!"ADMIN".equals(user.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only admins can update quizzes"));
            }
            
            // Allow existing quizzes to keep their category even if it's not in the current valid list
            Optional<Quiz> existingQuiz = quizService.getQuizById(id);
            if (existingQuiz.isPresent() && !existingQuiz.get().getCategory().equals(quiz.getCategory()) && 
                !VALID_CATEGORIES.contains(quiz.getCategory())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid category. Valid categories are: " + String.join(", ", VALID_CATEGORIES)));
            }
            
            Quiz updatedQuiz = quizService.updateQuiz(id, quiz, user.getId());
            return ResponseEntity.ok(QuizDTO.fromQuiz(updatedQuiz, true));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Publish a quiz (admin only)
     */
    @PostMapping("/{id}/publish")
    public ResponseEntity<?> publishQuiz(@PathVariable String id, Authentication auth) {
        try {
            User user = getUserFromAuth(auth);
            if (!"ADMIN".equals(user.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only admins can publish quizzes"));
            }
            
            Quiz publishedQuiz = quizService.publishQuiz(id, user.getId());
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Quiz published successfully",
                "quiz", QuizDTO.fromQuiz(publishedQuiz, true)
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Unpublish a quiz (admin only)
     */
    @PostMapping("/{id}/unpublish")
    public ResponseEntity<?> unpublishQuiz(@PathVariable String id, Authentication auth) {
        try {
            User user = getUserFromAuth(auth);
            if (!"ADMIN".equals(user.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only admins can unpublish quizzes"));
            }
            
            Quiz unpublishedQuiz = quizService.unpublishQuiz(id, user.getId());
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Quiz unpublished successfully",
                "quiz", QuizDTO.fromQuiz(unpublishedQuiz, true)
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Delete a quiz (admin only)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteQuiz(@PathVariable String id, Authentication auth) {
        try {
            User user = getUserFromAuth(auth);
            if (!"ADMIN".equals(user.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only admins can delete quizzes"));
            }
            
            quizService.deleteQuiz(id, user.getId());
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Quiz deleted successfully"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
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