package com.example.pafapp.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.pafapp.model.Comment;

@Repository
public interface CommentRepository extends MongoRepository<Comment, String> {
    
    // Find comments by ideaId (to list all comments for a specific skill sharing idea)
    List<Comment> findByIdeaIdOrderByCreatedAtDesc(String ideaId);
    
    // Count comments for a specific idea
    long countByIdeaId(String ideaId);
    
    // Delete all comments for a specific idea (useful when deleting an idea)
    void deleteByIdeaId(String ideaId);
}
