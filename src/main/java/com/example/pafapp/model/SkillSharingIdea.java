package com.example.pafapp.model;

import java.util.Date;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "skillSharingIdeas")
public class SkillSharingIdea {
    
    @Id
    private String id;
    
    private String title;
    
    private String description;
    
    private Date createdAt;
    
    // Default constructor
    public SkillSharingIdea() {
        this.createdAt = new Date();
    }
    
    // Constructor with fields
    public SkillSharingIdea(String title, String description) {
        this.title = title;
        this.description = description;
        this.createdAt = new Date();
    }
    
    // Getters and setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public Date getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }
    
    @Override
    public String toString() {
        return "SkillSharingIdea [id=" + id + ", title=" + title + 
               ", description=" + description + ", createdAt=" + createdAt + "]";
    }
}
