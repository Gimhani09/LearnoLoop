package com.example.demo.controller;

import com.example.demo.model.QuizAttempt;
import com.example.demo.service.QuizAttemptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quiz-attempts")
public class QuizAttemptController {

    @Autowired
    private QuizAttemptService quizAttemptService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<QuizAttempt>> getAttemptsByUserId(@PathVariable String userId) {
        return new ResponseEntity<>(quizAttemptService.getAttemptsByUserId(userId), HttpStatus.OK);
    }
    
    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<List<QuizAttempt>> getAttemptsByQuizId(@PathVariable String quizId) {
        return new ResponseEntity<>(quizAttemptService.getAttemptsByQuizId(quizId), HttpStatus.OK);
    }
    
    @GetMapping("/user/{userId}/quiz/{quizId}")
    public ResponseEntity<List<QuizAttempt>> getAttemptsByUserIdAndQuizId(
            @PathVariable String userId,
            @PathVariable String quizId) {
        return new ResponseEntity<>(
                quizAttemptService.getAttemptsByUserIdAndQuizId(userId, quizId),
                HttpStatus.OK
        );
    }

    @PostMapping("/start")
    public ResponseEntity<QuizAttempt> startQuizAttempt(
            @RequestParam String userId,
            @RequestParam String quizId) {
        QuizAttempt attempt = quizAttemptService.startQuizAttempt(userId, quizId);
        if (attempt != null) {
            return new ResponseEntity<>(attempt, HttpStatus.CREATED);
        }
        return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    }
    
    @PostMapping("/submit")
    public ResponseEntity<QuizAttempt> submitQuizAttempt(@RequestBody QuizAttempt attempt) {
        return new ResponseEntity<>(quizAttemptService.submitQuizAttempt(attempt), HttpStatus.OK);
    }
}
