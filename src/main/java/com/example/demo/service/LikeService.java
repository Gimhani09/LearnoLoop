package com.example.demo.service;

import com.example.demo.model.Like;
import com.example.demo.repository.LikeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class LikeService {

    @Autowired
    private LikeRepository likeRepository;

    public List<Like> getAllLikes() {
        return likeRepository.findAll();
    }

    public List<Like> getLikesBySkillId(String skillId) {
        return likeRepository.findBySkillId(skillId);
    }
    
    public List<Like> getLikesByUserId(String userId) {
        return likeRepository.findByUserId(userId);
    }
    
    public long countLikesBySkillId(String skillId) {
        return likeRepository.countBySkillId(skillId);
    }
    
    public boolean hasUserLikedSkill(String skillId, String userId) {
        return likeRepository.existsBySkillIdAndUserId(skillId, userId);
    }

    public Like addLike(String skillId, String userId) {
        // Check if user has already liked the skill
        Optional<Like> existingLike = likeRepository.findBySkillIdAndUserId(skillId, userId);
        
        if (existingLike.isPresent()) {
            return existingLike.get();
        }
        
        // Create new like
        Like like = new Like();
        like.setSkillId(skillId);
        like.setUserId(userId);
        like.setCreatedAt(LocalDateTime.now());
        
        return likeRepository.save(like);
    }

    public boolean removeLike(String skillId, String userId) {
        Optional<Like> like = likeRepository.findBySkillIdAndUserId(skillId, userId);
        
        if (like.isPresent()) {
            likeRepository.delete(like.get());
            return true;
        }
        
        return false;
    }
}
