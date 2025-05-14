package com.example.demo.controller;

import com.example.demo.model.Post;
import com.example.demo.repository.PostRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.CloudinaryService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class PostController {

    @Autowired
    private PostRepository postRepository;
    
    @Autowired
    private com.example.demo.repository.CommentRepository commentRepository;
    
    @Autowired
    private com.example.demo.repository.LikeRepository likeRepository;
    
    @Autowired
    private CloudinaryService cloudinaryService;
    
    @Autowired
    private UserRepository userRepository;

    @GetMapping("/posts")
    public ResponseEntity<?> getAllPosts() {
        List<Post> posts = postRepository.findAll();
        if (posts.isEmpty()) {
            return ResponseEntity.status(404).body("No posts available.");
        }
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/posts/active")
    public ResponseEntity<?> getActivePosts() {
        List<Post> posts = postRepository.findByStatus("ACTIVE");
        if (posts.isEmpty()) {
            return ResponseEntity.status(404).body("No active posts available.");
        }
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/posts/{id}")
    public ResponseEntity<Post> getPostById(@PathVariable String id) {
        return postRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/posts/user/{userId}")
    public ResponseEntity<?> getPostsByUserId(@PathVariable String userId) {
        List<Post> posts = postRepository.findByUserId(userId);
        if (posts.isEmpty()) {
            return ResponseEntity.status(404).body("No posts found for the user.");
        }
        return ResponseEntity.ok(posts);
    }
    
    @GetMapping("/posts/username/{username}")
    public ResponseEntity<?> getPostsByUsername(@PathVariable String username) {
        // Find the user first
        com.example.demo.model.User user = userRepository.findByUsername(username);
        if (user == null) {
            return ResponseEntity.status(404).body("User not found.");
        }
        
        // Get posts for this user's ID
        List<Post> posts = postRepository.findByUserId(user.getId());
        return ResponseEntity.ok(posts); // Return empty array instead of 404 when no posts
    }
    
    @PostMapping("/posts")
    public ResponseEntity<?> createPost(@RequestBody Post post) {
        try {
            post.setCreatedAt(LocalDateTime.now());
            post.setStatus("ACTIVE");
            
            // If photoUrl is provided but no photoPublicId, extract it from URL
            if (post.getPhotoUrl() != null && post.getPhotoPublicId() == null && 
                post.getPhotoUrl().contains("cloudinary.com")) {
                String publicId = cloudinaryService.getPublicIdFromUrl(post.getPhotoUrl());
                post.setPhotoPublicId(publicId);
            }
            
            // If videoUrl is provided but no videoPublicId, extract it from URL
            if (post.getVideoUrl() != null && post.getVideoPublicId() == null && 
                post.getVideoUrl().contains("cloudinary.com")) {
                String publicId = cloudinaryService.getPublicIdFromUrl(post.getVideoUrl());
                post.setVideoPublicId(publicId);
            }
            
            Post savedPost = postRepository.save(post);
            return ResponseEntity.ok(savedPost);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PutMapping("/posts/{id}")
    public ResponseEntity<?> updatePost(@PathVariable String id, @RequestBody Post updatedPost) {
        return postRepository.findById(id)
                .map(post -> {
                    // Update post fields
                    if (updatedPost.getTitle() != null) {
                        post.setTitle(updatedPost.getTitle());
                    }
                    if (updatedPost.getDescription() != null) {
                        post.setDescription(updatedPost.getDescription());
                    }
                    
                    // Update educational fields
                    if (updatedPost.getCategory() != null) {
                        post.setCategory(updatedPost.getCategory());
                    }
                    if (updatedPost.getLevel() != null) {
                        post.setLevel(updatedPost.getLevel());
                    }
                    if (updatedPost.getEstimatedTime() != null) {
                        post.setEstimatedTime(updatedPost.getEstimatedTime());
                    }
                    if (updatedPost.getLearningGoals() != null) {
                        post.setLearningGoals(updatedPost.getLearningGoals());
                    }
                    
                    // Handle image update
                    if (updatedPost.getPhotoUrl() != null && !updatedPost.getPhotoUrl().equals(post.getPhotoUrl())) {
                        // Delete old image from Cloudinary if it exists
                        try {
                            if (post.getPhotoPublicId() != null) {
                                cloudinaryService.deleteImage(post.getPhotoPublicId());
                            }
                        } catch (IOException e) {
                            System.err.println("Failed to delete old image: " + e.getMessage());
                            // Continue with update even if deletion fails
                        }
                        
                        post.setPhotoUrl(updatedPost.getPhotoUrl());
                        post.setPhotoPublicId(updatedPost.getPhotoPublicId());
                        
                        // Extract and save new public ID if it's a Cloudinary URL and no public ID was provided
                        if (updatedPost.getPhotoUrl().contains("cloudinary.com") && 
                            (updatedPost.getPhotoPublicId() == null || updatedPost.getPhotoPublicId().isEmpty())) {
                            String publicId = cloudinaryService.getPublicIdFromUrl(updatedPost.getPhotoUrl());
                            post.setPhotoPublicId(publicId);
                        } 
                    }
                    
                    // Handle video update
                    if (updatedPost.getVideoUrl() != null && !updatedPost.getVideoUrl().equals(post.getVideoUrl())) {
                        // Delete old video from Cloudinary if it exists
                        try {
                            if (post.getVideoPublicId() != null) {
                                cloudinaryService.deleteImage(post.getVideoPublicId());
                            }
                        } catch (IOException e) {
                            System.err.println("Failed to delete old video: " + e.getMessage());
                            // Continue with update even if deletion fails
                        }
                        
                        post.setVideoUrl(updatedPost.getVideoUrl());
                        post.setVideoPublicId(updatedPost.getVideoPublicId());
                        
                        // Extract and save new public ID if it's a Cloudinary URL and no public ID was provided
                        if (updatedPost.getVideoUrl().contains("cloudinary.com") && 
                            (updatedPost.getVideoPublicId() == null || updatedPost.getVideoPublicId().isEmpty())) {
                            String publicId = cloudinaryService.getPublicIdFromUrl(updatedPost.getVideoUrl());
                            post.setVideoPublicId(publicId);
                        } 
                    }
                    
                    // Make sure we don't change sensitive fields
                    post.setUpdatedAt(LocalDateTime.now());
                    
                    Post saved = postRepository.save(post);
                    return ResponseEntity.ok(saved);
                })
                .orElseGet(() -> {
                    // If post doesn't exist but ID is provided, create it with that ID
                    updatedPost.setId(id);
                    updatedPost.setCreatedAt(LocalDateTime.now());
                    updatedPost.setStatus("ACTIVE");
                    
                    Post saved = postRepository.save(updatedPost);
                    return ResponseEntity.ok(saved);
                });
    }
    
    @DeleteMapping("/posts/{id}")
    public ResponseEntity<?> deletePost(@PathVariable String id) {
        return postRepository.findById(id)
                .map(post -> {
                    try {
                        // Delete associated image from Cloudinary if exists
                        if (post.getPhotoPublicId() != null && !post.getPhotoPublicId().isEmpty()) {
                            try {
                                cloudinaryService.deleteImage(post.getPhotoPublicId());
                                System.out.println("Successfully deleted image with ID: " + post.getPhotoPublicId());
                            } catch (IOException e) {
                                System.err.println("Failed to delete image: " + e.getMessage());
                                // Continue with post deletion even if image deletion fails
                            }
                        }
                        
                        // Delete associated video from Cloudinary if exists
                        if (post.getVideoPublicId() != null && !post.getVideoPublicId().isEmpty()) {
                            try {
                                cloudinaryService.deleteImage(post.getVideoPublicId());
                                System.out.println("Successfully deleted video with ID: " + post.getVideoPublicId());
                            } catch (IOException e) {
                                System.err.println("Failed to delete video: " + e.getMessage());
                                // Continue with post deletion even if video deletion fails
                            }
                        }
                    
                        // Delete all comments and likes associated with this post
                        long commentsDeleted = commentRepository.deleteByPostId(id);
                        long likesDeleted = likeRepository.deleteByPostId(id);
                        
                        System.out.println("Deleted " + commentsDeleted + " comments and " + 
                                           likesDeleted + " likes for post ID: " + id);
                        
                        // Finally delete the post
                        postRepository.delete(post);
                        
                        Map<String, Object> response = new HashMap<>();
                        response.put("message", "Post deleted successfully");
                        response.put("commentsDeleted", commentsDeleted);
                        response.put("likesDeleted", likesDeleted);
                        
                        return ResponseEntity.ok(response);
                    } catch (Exception e) {
                        System.err.println("Error during post deletion: " + e.getMessage());
                        e.printStackTrace();
                        return ResponseEntity.internalServerError()
                                .body(Map.of("error", "Failed to delete post: " + e.getMessage()));
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }
}