package com.example.pafapp.model;

import java.util.Date;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "skillSharingIdeas")
public class SkillSharingIdea {
    
    @Id
    private String id;
    
    private String title;
    
    private String description;
    
    private String mediaUrl;
    
    private String mediaType; // "image" or "video"
    
    private String publicId; // Cloudinary public ID for deletion
    
    private int likesCount = 0; // Added likes counter with default value of 0
    
    @CreatedDate
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
      // Constructor with fields including media
    public SkillSharingIdea(String title, String description, String mediaUrl, String mediaType, String publicId) {
        this.title = title;
        this.description = description;
        this.mediaUrl = mediaUrl;
        this.mediaType = mediaType;
        this.publicId = publicId;
        this.likesCount = 0;
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
    
    public String getMediaUrl() {
        return mediaUrl;
    }
    
    public void setMediaUrl(String mediaUrl) {
        this.mediaUrl = mediaUrl;
    }
    
    public String getMediaType() {
        return mediaType;
    }
    
    public void setMediaType(String mediaType) {
        this.mediaType = mediaType;
    }
    
    public String getPublicId() {
        return publicId;
    }
    
    public void setPublicId(String publicId) {
        this.publicId = publicId;
    }
    
    public int getLikesCount() {
        return likesCount;
    }
    
    public void setLikesCount(int likesCount) {
        this.likesCount = likesCount;
    }
      @Override
    public String toString() {
        return "SkillSharingIdea [id=" + id + ", title=" + title + 
               ", description=" + description + ", mediaUrl=" + mediaUrl + 
               ", mediaType=" + mediaType + ", likesCount=" + likesCount + 
               ", createdAt=" + createdAt + "]";
    }
}
