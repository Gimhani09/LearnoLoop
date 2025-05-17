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
}
