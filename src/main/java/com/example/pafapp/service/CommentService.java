package com.example.pafapp.service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.pafapp.model.Comment;
import com.example.pafapp.repository.CommentRepository;

@Service
public class CommentService {
    private final CommentRepository commentRepository;
    
    @Autowired
    public CommentService(CommentRepository commentRepository) {
        this.commentRepository = commentRepository;
    }
      /**
     * Save a new comment
     */
    public Comment saveComment(Comment comment) {
        if (comment.getCreatedAt() == null) {
            comment.setCreatedAt(new Date());
        }
        return commentRepository.save(comment);
    }
    
    /**
     * Find comment by ID
     */
    public Optional<Comment> findById(String id) {
        return commentRepository.findById(id);
    }
      /**
     * Find all comments for an idea
     */
    public List<Comment> findByIdeaIdOrderByCreatedAtDesc(String ideaId) {
        return commentRepository.findByIdeaIdOrderByCreatedAtDesc(ideaId);
    }
    
    /**
     * Count comments for an idea
     */
    public long countByIdeaId(String ideaId) {
        return commentRepository.countByIdeaId(ideaId);
    }
      /**
     * Delete comment by ID
     */
    public void deleteById(String id) {
        commentRepository.deleteById(id);
    }
    
    /**
     * Delete all comments for an idea
     */
    public void deleteByIdeaId(String ideaId) {
        commentRepository.deleteByIdeaId(ideaId);
    }
}
