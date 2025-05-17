package com.example.pafapp.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.pafapp.model.SkillSharingIdea;

@Repository
public interface SkillSharingIdeaRepository extends MongoRepository<SkillSharingIdea, String> {
    // Spring Data MongoDB will automatically implement the basic CRUD operations
    // We don't need to define any methods here for basic operations
}
