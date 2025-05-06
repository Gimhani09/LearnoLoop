package com.example.demo.controller;

import com.example.demo.model.Comment;
import com.example.demo.repository.CommentRepository;
import com.example.demo.repository.PostRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class CommentController {

    @Autowired
    private CommentRepository commentRepository;
    
    @Autowired
    private PostRepository postRepository;

    @GetMapping("/post/{postId}")
    public ResponseEntity<?> getCommentsByPostId(@PathVariable String postId) {
        // Check if post exists
        if (!postRepository.existsById(postId)) {
            return ResponseEntity.notFound().build();
        }
        
        List<Comment> comments = commentRepository.findByPostId(postId);
        return ResponseEntity.ok(comments);
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getCommentsByUserId(@PathVariable String userId) {
        List<Comment> comments = commentRepository.findByUserId(userId);
        return ResponseEntity.ok(comments);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getCommentById(@PathVariable String id) {
        return commentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<?> createComment(@RequestBody Comment comment) {
        // Validate required fields
        if (comment.getPostId() == null || comment.getUserId() == null || comment.getText() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing required fields: postId, userId, text"));
        }
        
        // Check if post exists
        if (!postRepository.existsById(comment.getPostId())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Post not found"));
        }
        
        // Set creation timestamp
        comment.setCreatedAt(LocalDateTime.now());
        
        Comment savedComment = commentRepository.save(comment);
        return ResponseEntity.ok(savedComment);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateComment(@PathVariable String id, @RequestBody Comment updatedComment) {
        return commentRepository.findById(id)
                .map(comment -> {
                    // Only allow updating the text
                    if (updatedComment.getText() != null) {
                        comment.setText(updatedComment.getText());
                    }
                    comment.setUpdatedAt(LocalDateTime.now());
                    
                    Comment saved = commentRepository.save(comment);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComment(@PathVariable String id) {
        return commentRepository.findById(id)
                .map(comment -> {
                    commentRepository.delete(comment);
                    return ResponseEntity.ok(Map.of("message", "Comment deleted successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}