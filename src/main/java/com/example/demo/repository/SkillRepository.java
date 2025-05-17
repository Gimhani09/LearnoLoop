package com.example.demo.repository;

import com.example.demo.model.Skill;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SkillRepository extends MongoRepository<Skill, String> {
    List<Skill> findByUserId(String userId);
    List<Skill> findByLevel(String level);
    List<Skill> findByCategory(String category);
    List<Skill> findByTagsContaining(String tag);
}
