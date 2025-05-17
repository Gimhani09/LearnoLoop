package com.example.demo.repository;

import com.example.demo.model.QuizAttempt;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizAttemptRepository extends MongoRepository<QuizAttempt, String> {
    List<QuizAttempt> findByUserId(String userId);
    List<QuizAttempt> findByQuizId(String quizId);
    List<QuizAttempt> findByUserIdAndQuizId(String userId, String quizId);
    List<QuizAttempt> findByUserIdAndCompleted(String userId, boolean completed);
    long countByQuizId(String quizId);
    long countByQuizIdAndPassed(String quizId, boolean passed);

    // Additional methods needed by BadgeService
    long countByUserId(String userId);
    long countByUserIdAndScore(String userId, int score);
    long countByUserIdAndScoreGreaterThanEqual(String userId, int score);
    long countByUserIdAndPassedAndTimeTakenLessThanEqual(String userId, boolean passed, int timeTaken);
    List<QuizAttempt> findByUserIdAndCategory(String userId, String category);
    List<QuizAttempt> findByUserIdOrderByCompletedAtDesc(String userId);
    
    // New method for sorting attempts by completion date
    List<QuizAttempt> findByUserIdAndCompletedOrderByCompletedAtDesc(String userId, boolean completed);
}