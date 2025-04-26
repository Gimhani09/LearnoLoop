package com.example.demo.repository;

import com.example.demo.model.Like;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface LikeRepository extends MongoRepository<Like, String> {
    List<Like> findBySkillId(String skillId);
    List<Like> findByUserId(String userId);
    Optional<Like> findBySkillIdAndUserId(String skillId, String userId);
    long countBySkillId(String skillId);
    boolean existsBySkillIdAndUserId(String skillId, String userId);
}
