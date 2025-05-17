package com.example.demo.controller;

import com.example.demo.model.Post;
import com.example.demo.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class PostController {

    @Autowired
    private PostRepository postRepository;

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
}