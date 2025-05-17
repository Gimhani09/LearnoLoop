package com.example.demo.controller;

import com.example.demo.model.Quiz;
import com.example.demo.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {

    @Autowired
    private QuizService quizService;

    @GetMapping
    public ResponseEntity<List<Quiz>> getAllQuizzes() {
        return new ResponseEntity<>(quizService.getAllQuizzes(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Quiz> getQuizById(@PathVariable String id) {
        Optional<Quiz> quiz = quizService.getQuizById(id);
        return quiz.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
    
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Quiz>> getQuizzesByCategory(@PathVariable String category) {
        return new ResponseEntity<>(quizService.getQuizzesByCategory(category), HttpStatus.OK);
    }
    
    @GetMapping("/level/{level}")
    public ResponseEntity<List<Quiz>> getQuizzesByLevel(@PathVariable String level) {
        return new ResponseEntity<>(quizService.getQuizzesByLevel(level), HttpStatus.OK);
    }
    
    @GetMapping("/creator/{creatorId}")
    public ResponseEntity<List<Quiz>> getQuizzesByCreator(@PathVariable String creatorId) {
        return new ResponseEntity<>(quizService.getQuizzesByCreator(creatorId), HttpStatus.OK);
    }
    
    @GetMapping("/filter")
    public ResponseEntity<List<Quiz>> getQuizzesByCategoryAndLevel(
            @RequestParam String category,
            @RequestParam String level) {
        return new ResponseEntity<>(quizService.getQuizzesByCategoryAndLevel(category, level), HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Quiz> createQuiz(@RequestBody Quiz quiz) {
        return new ResponseEntity<>(quizService.createQuiz(quiz), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Quiz> updateQuiz(@PathVariable String id, @RequestBody Quiz quiz) {
        Quiz updatedQuiz = quizService.updateQuiz(id, quiz);
        if (updatedQuiz != null) {
            return new ResponseEntity<>(updatedQuiz, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.FORBIDDEN);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuiz(
            @PathVariable String id,
            @RequestParam String userId) {
        boolean deleted = quizService.deleteQuiz(id, userId);
        if (deleted) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(HttpStatus.FORBIDDEN);
    }
}
