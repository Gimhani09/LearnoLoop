package com.example.pafapp.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.pafapp.model.SkillSharingIdea;
import com.example.pafapp.repository.SkillSharingIdeaRepository;
import com.example.pafapp.service.CloudinaryService;
import com.example.pafapp.service.CommentService;

@RestController
@RequestMapping("/api/ideas")
@CrossOrigin(origins = "*")
public class SkillSharingIdeaController {    
    @Autowired
    private SkillSharingIdeaRepository repository;
    
    @Autowired
    private CloudinaryService cloudinaryService;
    
    @Autowired
    private CommentService commentService;
    
    // Create a new SkillSharingIdea
    @PostMapping
    public ResponseEntity<SkillSharingIdea> createIdea(@RequestBody SkillSharingIdea idea) {
        SkillSharingIdea savedIdea = repository.save(idea);
        return new ResponseEntity<>(savedIdea, HttpStatus.CREATED);
    }
    
    // Create a new SkillSharingIdea with media
    @PostMapping(value = "/with-media", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SkillSharingIdea> createIdeaWithMedia(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestPart(value = "media", required = false) MultipartFile media) {
        
        try {
            SkillSharingIdea idea = new SkillSharingIdea();
            idea.setTitle(title);
            idea.setDescription(description);
              // Upload media if present
            if (media != null && !media.isEmpty()) {
                Map<String, Object> uploadResult = cloudinaryService.upload(media);
                
                idea.setMediaUrl((String) uploadResult.get("secure_url"));
                idea.setPublicId((String) uploadResult.get("public_id"));
                
                // Determine media type based on resource_type returned by Cloudinary
                String resourceType = (String) uploadResult.get("resource_type");
                idea.setMediaType(resourceType); // "image" or "video"
            }
            
            SkillSharingIdea savedIdea = repository.save(idea);
            return new ResponseEntity<>(savedIdea, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
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
    }      // Update a SkillSharingIdea
    @PutMapping("/{id}")
    public ResponseEntity<SkillSharingIdea> updateIdea(@PathVariable("id") String id, @RequestBody SkillSharingIdea idea) {
        Optional<SkillSharingIdea> ideaData = repository.findById(id);
        
        if (ideaData.isPresent()) {
            SkillSharingIdea updatedIdea = ideaData.get();
            // Update fields but preserve the original creation date
            updatedIdea.setTitle(idea.getTitle());
            updatedIdea.setDescription(idea.getDescription());
              // Update media fields if they exist in the request
            if (idea.getMediaUrl() != null) {
                updatedIdea.setMediaUrl(idea.getMediaUrl());
            }
            if (idea.getMediaType() != null) {
                updatedIdea.setMediaType(idea.getMediaType());
            }
            if (idea.getPublicId() != null) {
                updatedIdea.setPublicId(idea.getPublicId());
            }
            
            // Preserve the likes count
            // Don't update createdAt or likesCount - keep the original values
            return new ResponseEntity<>(repository.save(updatedIdea), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    // Update a SkillSharingIdea with media
    @PostMapping(value = "/update/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SkillSharingIdea> updateIdeaWithMedia(
            @PathVariable("id") String id,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestPart(value = "media", required = false) MultipartFile media) {
        
        Optional<SkillSharingIdea> ideaData = repository.findById(id);
        
        if (ideaData.isPresent()) {
            SkillSharingIdea updatedIdea = ideaData.get();
            updatedIdea.setTitle(title);
            updatedIdea.setDescription(description);
            
            // If new media is uploaded, delete old one if exists
            if (media != null && !media.isEmpty()) {
                // Delete old media if it exists
                if (updatedIdea.getPublicId() != null) {
                    try {
                        cloudinaryService.delete(updatedIdea.getPublicId());
                    } catch (Exception e) {
                        // Log the error but continue with the update
                        System.err.println("Failed to delete old media: " + e.getMessage());
                    }
                }
                  // Upload new media
                try {
                    Map<String, Object> uploadResult = cloudinaryService.upload(media);
                    
                    updatedIdea.setMediaUrl((String) uploadResult.get("secure_url"));
                    updatedIdea.setPublicId((String) uploadResult.get("public_id"));
                    updatedIdea.setMediaType((String) uploadResult.get("resource_type")); // "image" or "video"
                } catch (Exception e) {
                    return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
                }
            }
            
            return new ResponseEntity<>(repository.save(updatedIdea), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }    // Delete a SkillSharingIdea
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteIdea(@PathVariable("id") String id) {
        try {
            // Get the idea first to check if it has media
            Optional<SkillSharingIdea> ideaData = repository.findById(id);
            
            if (ideaData.isPresent()) {
                SkillSharingIdea idea = ideaData.get();
                
                // Delete media from Cloudinary if it exists
                if (idea.getPublicId() != null && !idea.getPublicId().isEmpty()) {
                    try {
                        cloudinaryService.delete(idea.getPublicId());
                    } catch (Exception e) {
                        // Log the error but continue with deletion from database
                        System.err.println("Failed to delete media from Cloudinary: " + e.getMessage());
                    }
                }
                  // Delete all comments associated with this idea
                try {
                    commentService.deleteByIdeaId(id);
                } catch (Exception e) {
                    System.err.println("Failed to delete associated comments: " + e.getMessage());
                }
            }
            
            // Delete idea from database
            repository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
      // Like/unlike functionality moved to LikeController
}
