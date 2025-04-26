package com.example.demo.repository;

import com.example.demo.model.Comment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CommentRepository extends MongoRepository<Comment, String> {
    List<Comment> findBySkillId(String skillId);
    List<Comment> findByUserId(String userId);
}
