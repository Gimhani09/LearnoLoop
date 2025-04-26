package com.example.demo.service;

import com.example.demo.model.Skill;
import com.example.demo.repository.SkillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class SkillService {

    @Autowired
    private SkillRepository skillRepository;

    public List<Skill> getAllSkills() {
        return skillRepository.findAll();
    }

    public Optional<Skill> getSkillById(String id) {
        return skillRepository.findById(id);
    }

    public List<Skill> getSkillsByUserId(String userId) {
        return skillRepository.findByUserId(userId);
    }

    public List<Skill> getSkillsByLevel(String level) {
        return skillRepository.findByLevel(level);
    }

    public List<Skill> getSkillsByCategory(String category) {
        return skillRepository.findByCategory(category);
    }

    public List<Skill> getSkillsByTag(String tag) {
        return skillRepository.findByTagsContaining(tag);
    }

    public Skill createSkill(Skill skill) {
        skill.setCreatedAt(LocalDateTime.now());
        skill.setUpdatedAt(LocalDateTime.now());
        
        // Validate images (max 3)
        if (skill.getImages() != null && skill.getImages().size() > 3) {
            skill.setImages(skill.getImages().subList(0, 3));
        }
        
        return skillRepository.save(skill);
    }

    public Skill updateSkill(String id, Skill skill) {
        Optional<Skill> existingSkill = skillRepository.findById(id);
        
        if (existingSkill.isPresent()) {
            skill.setId(id);
            skill.setCreatedAt(existingSkill.get().getCreatedAt());
            skill.setUpdatedAt(LocalDateTime.now());
            
            // Validate images (max 3)
            if (skill.getImages() != null && skill.getImages().size() > 3) {
                skill.setImages(skill.getImages().subList(0, 3));
            }
            
            return skillRepository.save(skill);
        }
        
        return null;
    }

    public void deleteSkill(String id) {
        skillRepository.deleteById(id);
    }
}
