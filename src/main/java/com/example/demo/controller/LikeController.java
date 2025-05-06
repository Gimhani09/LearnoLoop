package com.example.demo.controller;

import com.example.demo.model.Like;
import com.example.demo.repository.LikeRepository;
import com.example.demo.repository.PostRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.HashMap;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class LikeController {

    @Autowired
    private LikeRepository likeRepository;
    
    @Autowired
    private PostRepository postRepository;

    @GetMapping("/{postId}/likes")
    public ResponseEntity<?> getLikesByPostId(@PathVariable String postId) {
        try {
            // Check if post exists
            if (!postRepository.existsById(postId)) {
                return ResponseEntity.notFound().build();
            }
            
            List<Like> likes = likeRepository.findByPostId(postId);
            return ResponseEntity.ok(likes);
        } catch (Exception e) {
            System.err.println("Error getting likes for post " + postId + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to retrieve likes: " + e.getMessage()));
        }
    }
    
    @PostMapping("/{postId}/like")
    public ResponseEntity<?> likePost(@PathVariable String postId, @RequestBody Map<String, String> body) {
        try {
            String userId = body.get("userId");
            
            // Validate required field
            if (userId == null || userId.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "userId is required"));
            }
            
            // Check if post exists
            if (!postRepository.existsById(postId)) {
                return ResponseEntity.notFound().build();
            }
            
            // Check if user already liked this post
            Optional<Like> existingLike = likeRepository.findByPostIdAndUserId(postId, userId);
            if (existingLike.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("error", "User has already liked this post");
                response.put("like", existingLike.get());
                return ResponseEntity.ok(response); // Changed to OK to avoid frontend errors
            }
            
            // Create new like
            Like like = new Like();
            like.setPostId(postId);
            like.setUserId(userId);
            like.setCreatedAt(LocalDateTime.now());
            
            Like savedLike = likeRepository.save(like);
            return ResponseEntity.ok(savedLike);
        } catch (Exception e) {
            System.err.println("Error liking post " + postId + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to like post: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/{postId}/like/{userId}")
    public ResponseEntity<?> unlikePost(@PathVariable String postId, @PathVariable String userId) {
        try {
            // Check if post exists
            if (!postRepository.existsById(postId)) {
                return ResponseEntity.notFound().build();
            }
            
            // Find the like
            Optional<Like> like = likeRepository.findByPostIdAndUserId(postId, userId);
            
            if (like.isPresent()) {
                // Delete the like using the ID for better reliability
                likeRepository.deleteById(like.get().getId());
                return ResponseEntity.ok(Map.of(
                    "message", "Like removed successfully",
                    "likeId", like.get().getId()
                ));
            } else {
                // If the like doesn't exist, try to delete by composite key
                long deleted = likeRepository.deleteByPostIdAndUserId(postId, userId);
                if (deleted > 0) {
                    return ResponseEntity.ok(Map.of(
                        "message", "Like removed successfully using composite key",
                        "count", deleted
                    ));
                }
                // If no like found with either method, return not found
                return ResponseEntity.ok(Map.of("message", "No like found to remove"));
            }
        } catch (Exception e) {
            System.err.println("Error unliking post " + postId + " for user " + userId + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to unlike post: " + e.getMessage()));
        }
    }
    
    @GetMapping("/user/{userId}/likes")
    public ResponseEntity<?> getLikesByUserId(@PathVariable String userId) {
        try {
            List<Like> likes = likeRepository.findByUserId(userId);
            return ResponseEntity.ok(likes);
        } catch (Exception e) {
            System.err.println("Error getting likes for user " + userId + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to retrieve user likes: " + e.getMessage()));
        }
    }
}