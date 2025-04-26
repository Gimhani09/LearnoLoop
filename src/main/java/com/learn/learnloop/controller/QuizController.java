package com.learn.learnloop.controller;

import com.learn.learnloop.model.Quiz;
import com.learn.learnloop.repository.QuizRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/quizzes")
@CrossOrigin
public class QuizController {

    @Autowired
    private QuizRepository quizRepo;

    @PostMapping
    public Quiz createQuiz(@RequestBody Quiz quiz) {
        return quizRepo.save(quiz);
    }

    @GetMapping
    public List<Quiz> getAllQuizzes() {
        return quizRepo.findAll();
    }

    @GetMapping("/{id}")
    public Optional<Quiz> getQuiz(@PathVariable String id) {
        return quizRepo.findById(id);
    }

    @PutMapping("/{id}")
    public Quiz updateQuiz(@PathVariable String id, @RequestBody Quiz updatedQuiz) {
        updatedQuiz.setId(id);
        return quizRepo.save(updatedQuiz);
    }

    @DeleteMapping("/{id}")
    public void deleteQuiz(@PathVariable String id) {
        quizRepo.deleteById(id);
    }
}
