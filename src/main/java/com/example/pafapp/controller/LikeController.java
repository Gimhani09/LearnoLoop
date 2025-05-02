package com.example.pafapp.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.pafapp.model.SkillSharingIdea;
import com.example.pafapp.repository.SkillSharingIdeaRepository;

@RestController
@RequestMapping("/api/likes")
@CrossOrigin(origins = "*")
public class LikeController {

    @Autowired
    private SkillSharingIdeaRepository repository;

    // Like an idea
    @PostMapping("/{id}/like")
    public ResponseEntity<SkillSharingIdea> likeIdea(@PathVariable("id") String id) {
        Optional<SkillSharingIdea> ideaData = repository.findById(id);
        
        if (ideaData.isPresent()) {
            SkillSharingIdea idea = ideaData.get();
            // Increment the likes count
            idea.setLikesCount(idea.getLikesCount() + 1);
            return new ResponseEntity<>(repository.save(idea), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    // Unlike an idea (decrement likes)
    @PostMapping("/{id}/unlike")
    public ResponseEntity<SkillSharingIdea> unlikeIdea(@PathVariable("id") String id) {
        Optional<SkillSharingIdea> ideaData = repository.findById(id);
        
        if (ideaData.isPresent()) {
            SkillSharingIdea idea = ideaData.get();
            // Only decrement if likes count is greater than 0
            if (idea.getLikesCount() > 0) {
                idea.setLikesCount(idea.getLikesCount() - 1);
            }
            return new ResponseEntity<>(repository.save(idea), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
