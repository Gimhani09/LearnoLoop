package com.example.demo.repository;

import com.example.demo.model.Quiz;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizRepository extends MongoRepository<Quiz, String> {
    
    List<Quiz> findByIsPublished(boolean isPublished);
    
    List<Quiz> findByCreatedBy(String userId);
    
    List<Quiz> findByCategory(String category);
    
    List<Quiz> findByIsPublishedAndCategory(boolean isPublished, String category);
}