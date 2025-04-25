package com.example.demo.repository;

import com.example.demo.model.Post;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface PostRepository extends MongoRepository<Post, String> {
    List<Post> findByStatus(String status);
    List<Post> findByUserId(String userId);
} 