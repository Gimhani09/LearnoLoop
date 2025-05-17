package com.example.pafapp.model;

import java.util.Date;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "comments")
public class Comment {
    
    @Id
    private String id;
    
    private String content;
    
    private String author;
    
    private String ideaId; // Reference to the SkillSharingIdea
    
    @CreatedDate
    private Date createdAt;
    
    // Default constructor
    public Comment() {
        this.createdAt = new Date();
    }
    
    // Constructor with fields
    public Comment(String content, String author, String ideaId) {
        this.content = content;
        this.author = author;
        this.ideaId = ideaId;
        this.createdAt = new Date();
    }
    
    // Getters and setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    public String getAuthor() {
        return author;
    }
    
    public void setAuthor(String author) {
        this.author = author;
    }
    
    public String getIdeaId() {
        return ideaId;
    }
    
    public void setIdeaId(String ideaId) {
        this.ideaId = ideaId;
    }
    
    public Date getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }
    
    @Override
    public String toString() {
        return "Comment [id=" + id + ", content=" + content + 
               ", author=" + author + ", ideaId=" + ideaId + 
               ", createdAt=" + createdAt + "]";
    }
}
