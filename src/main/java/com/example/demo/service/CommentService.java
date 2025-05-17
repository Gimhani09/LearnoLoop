package com.example.demo.service;

import com.example.demo.model.Comment;
import com.example.demo.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    public List<Comment> getAllComments() {
        return commentRepository.findAll();
    }

    public Optional<Comment> getCommentById(String id) {
        return commentRepository.findById(id);
    }
    
    public List<Comment> getCommentsBySkillId(String skillId) {
        return commentRepository.findBySkillId(skillId);
    }
    
    public List<Comment> getCommentsByUserId(String userId) {
        return commentRepository.findByUserId(userId);
    }

    public Comment createComment(Comment comment) {
        comment.setCreatedAt(LocalDateTime.now());
        comment.setUpdatedAt(LocalDateTime.now());
        return commentRepository.save(comment);
    }

    public Comment updateComment(String id, Comment comment) {
        Optional<Comment> existingComment = commentRepository.findById(id);
        
        if (existingComment.isPresent()) {
            Comment originalComment = existingComment.get();
            
            // Only allow the user who created the comment to update it
            if (comment.getUserId().equals(originalComment.getUserId())) {
                comment.setId(id);
                comment.setCreatedAt(originalComment.getCreatedAt());
                comment.setUpdatedAt(LocalDateTime.now());
                return commentRepository.save(comment);
            }
        }
        
        return null;
    }

    public boolean deleteComment(String id, String userId) {
        Optional<Comment> comment = commentRepository.findById(id);
        
        if (comment.isPresent() && comment.get().getUserId().equals(userId)) {
            commentRepository.deleteById(id);
            return true;
        }
        
        return false;
    }
}
