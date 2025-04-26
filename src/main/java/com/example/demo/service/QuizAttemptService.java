package com.example.demo.service;

import com.example.demo.model.Quiz;
import com.example.demo.model.QuizAttempt;
import com.example.demo.repository.QuizAttemptRepository;
import com.example.demo.repository.QuizRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class QuizAttemptService {

    @Autowired
    private QuizAttemptRepository quizAttemptRepository;
    
    @Autowired
    private QuizRepository quizRepository;

    public List<QuizAttempt> getAttemptsByUserId(String userId) {
        return quizAttemptRepository.findByUserId(userId);
    }
    
    public List<QuizAttempt> getAttemptsByQuizId(String quizId) {
        return quizAttemptRepository.findByQuizId(quizId);
    }
    
    public List<QuizAttempt> getAttemptsByUserIdAndQuizId(String userId, String quizId) {
        return quizAttemptRepository.findByUserIdAndQuizId(userId, quizId);
    }

    public QuizAttempt startQuizAttempt(String userId, String quizId) {
        Optional<Quiz> quizOptional = quizRepository.findById(quizId);
        
        if (quizOptional.isPresent() && quizOptional.get().isActive()) {
            QuizAttempt attempt = new QuizAttempt();
            attempt.setUserId(userId);
            attempt.setQuizId(quizId);
            attempt.setStartedAt(LocalDateTime.now());
            attempt.setTotalPoints(calculateTotalPoints(quizOptional.get()));
            
            return quizAttemptRepository.save(attempt);
        }
        
        return null;
    }
    
    public QuizAttempt submitQuizAttempt(QuizAttempt attempt) {
        attempt.setCompletedAt(LocalDateTime.now());
        
        // Calculate score
        int score = attempt.getAnswers().stream()
                .filter(answer -> answer.isCorrect())
                .mapToInt(answer -> answer.getPointsEarned())
                .sum();
        
        attempt.setScore(score);
        
        return quizAttemptRepository.save(attempt);
    }
    
    private int calculateTotalPoints(Quiz quiz) {
        return quiz.getQuestions().stream()
                .mapToInt(question -> question.getPoints())
                .sum();
    }
}
