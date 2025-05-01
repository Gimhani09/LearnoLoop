package com.example.pafapp.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.pafapp.model.SkillSharingIdea;
import com.example.pafapp.repository.SkillSharingIdeaRepository;

@RestController
@RequestMapping("/api/ideas")
public class SkillSharingIdeaController {

    @Autowired
    private SkillSharingIdeaRepository repository;
    
    // Create a new SkillSharingIdea
    @PostMapping
    public ResponseEntity<SkillSharingIdea> createIdea(@RequestBody SkillSharingIdea idea) {
        SkillSharingIdea savedIdea = repository.save(idea);
        return new ResponseEntity<>(savedIdea, HttpStatus.CREATED);
    }
    
    // Get all SkillSharingIdeas
    @GetMapping
    public ResponseEntity<List<SkillSharingIdea>> getAllIdeas() {
        List<SkillSharingIdea> ideas = repository.findAll();
        return new ResponseEntity<>(ideas, HttpStatus.OK);
    }
    
    // Get a SkillSharingIdea by ID
    @GetMapping("/{id}")
    public ResponseEntity<SkillSharingIdea> getIdeaById(@PathVariable("id") String id) {
        Optional<SkillSharingIdea> ideaData = repository.findById(id);
        
        if (ideaData.isPresent()) {
            return new ResponseEntity<>(ideaData.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    // Update a SkillSharingIdea
    @PutMapping("/{id}")
    public ResponseEntity<SkillSharingIdea> updateIdea(@PathVariable("id") String id, @RequestBody SkillSharingIdea idea) {
        Optional<SkillSharingIdea> ideaData = repository.findById(id);
        
        if (ideaData.isPresent()) {
            SkillSharingIdea updatedIdea = ideaData.get();
            updatedIdea.setTitle(idea.getTitle());
            updatedIdea.setDescription(idea.getDescription());
            return new ResponseEntity<>(repository.save(updatedIdea), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    // Delete a SkillSharingIdea
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteIdea(@PathVariable("id") String id) {
        try {
            repository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
