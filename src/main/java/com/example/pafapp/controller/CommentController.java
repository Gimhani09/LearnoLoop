package com.example.pafapp.controller;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.pafapp.model.Comment;
import com.example.pafapp.repository.SkillSharingIdeaRepository;
import com.example.pafapp.service.CommentService;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;
    
    @Autowired
    private SkillSharingIdeaRepository ideaRepository;
      // Get all comments for a specific idea
    @GetMapping("/idea/{ideaId}")
    public ResponseEntity<List<Comment>> getCommentsByIdeaId(@PathVariable String ideaId) {
        // Check if idea exists
        if (!ideaRepository.existsById(ideaId)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        List<Comment> comments = commentService.findByIdeaIdOrderByCreatedAtDesc(ideaId);
        return new ResponseEntity<>(comments, HttpStatus.OK);
    }
    
    // Get a specific comment by ID
    @GetMapping("/{id}")
    public ResponseEntity<Comment> getCommentById(@PathVariable String id) {
        Optional<Comment> comment = commentService.findById(id);
        
        if (comment.isPresent()) {
            return new ResponseEntity<>(comment.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
      // Add a new comment to an idea
    @PostMapping("/idea/{ideaId}")
    public ResponseEntity<Comment> createComment(@PathVariable String ideaId, @RequestBody Comment comment) {
        // Check if idea exists
        if (!ideaRepository.existsById(ideaId)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        try {            comment.setIdeaId(ideaId);
            comment.setCreatedAt(new Date());
            Comment savedComment = commentService.saveComment(comment);
            return new ResponseEntity<>(savedComment, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Update a comment
    @PutMapping("/{id}")
    public ResponseEntity<Comment> updateComment(@PathVariable String id, @RequestBody Comment comment) {
        Optional<Comment> commentData = commentService.findById(id);
        
        if (commentData.isPresent()) {
            Comment updatedComment = commentData.get();
            updatedComment.setContent(comment.getContent());
            // You may want to add additional fields to update
            return new ResponseEntity<>(commentService.saveComment(updatedComment), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    // Delete a comment
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteComment(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            commentService.deleteById(id);
            response.put("success", true);
            response.put("message", "Comment deleted successfully");
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete comment: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Delete all comments for an idea (when idea is deleted)
    @DeleteMapping("/idea/{ideaId}")
    public ResponseEntity<Map<String, Object>> deleteCommentsByIdeaId(@PathVariable String ideaId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            commentService.deleteByIdeaId(ideaId);
            response.put("success", true);
            response.put("message", "All comments for idea deleted successfully");
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete comments: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Get comment count for an idea
    @GetMapping("/count/idea/{ideaId}")
    public ResponseEntity<Map<String, Object>> getCommentCount(@PathVariable String ideaId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            long count = commentService.countByIdeaId(ideaId);
            response.put("count", count);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
