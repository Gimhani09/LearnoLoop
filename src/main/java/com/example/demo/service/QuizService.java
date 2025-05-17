package com.example.demo.service;

import com.example.demo.model.Quiz;
import com.example.demo.repository.QuizRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class QuizService {

    @Autowired
    private QuizRepository quizRepository;

    public List<Quiz> getAllQuizzes() {
        return quizRepository.findAll();
    }

    public Optional<Quiz> getQuizById(String id) {
        return quizRepository.findById(id);
    }
    
    public List<Quiz> getQuizzesByCategory(String category) {
        return quizRepository.findByCategory(category);
    }
    
    public List<Quiz> getQuizzesByLevel(String level) {
        return quizRepository.findByLevel(level);
    }
    
    public List<Quiz> getQuizzesByCreator(String creatorId) {
        return quizRepository.findByCreatorId(creatorId);
    }
    
    public List<Quiz> getQuizzesByCategoryAndLevel(String category, String level) {
        return quizRepository.findByCategoryAndLevel(category, level);
    }

    public Quiz createQuiz(Quiz quiz) {
        quiz.setCreatedAt(LocalDateTime.now());
        quiz.setUpdatedAt(LocalDateTime.now());
        quiz.setActive(true);
        
        // Generate UUIDs for each question
        quiz.getQuestions().forEach(question -> {
            if (question.getId() == null || question.getId().isEmpty()) {
                question.setId(UUID.randomUUID().toString());
            }
        });
        
        return quizRepository.save(quiz);
    }

    public Quiz updateQuiz(String id, Quiz quiz) {
        Optional<Quiz> existingQuiz = quizRepository.findById(id);
        
        if (existingQuiz.isPresent()) {
            Quiz originalQuiz = existingQuiz.get();
            
            // Only allow the creator to update the quiz
            if (quiz.getCreatorId().equals(originalQuiz.getCreatorId())) {
                quiz.setId(id);
                quiz.setCreatedAt(originalQuiz.getCreatedAt());
                quiz.setUpdatedAt(LocalDateTime.now());
                
                // Generate UUIDs for new questions
                quiz.getQuestions().forEach(question -> {
                    if (question.getId() == null || question.getId().isEmpty()) {
                        question.setId(UUID.randomUUID().toString());
                    }
                });
                
                return quizRepository.save(quiz);
            }
        }
        
        return null;
    }

    public boolean deleteQuiz(String id, String userId) {
        Optional<Quiz> quiz = quizRepository.findById(id);
        
        if (quiz.isPresent() && quiz.get().getCreatorId().equals(userId)) {
            quizRepository.deleteById(id);
            return true;
        }
        
        return false;
    }
}
