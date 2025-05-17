package com.example.demo.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import lombok.Data;

@Data
@Document(collection = "posts")
public class Post {
    @Id
    private String id;
    
    private String title;
    private String photoUrl;
    private String description;
    private String _class;
    private int reportCount;
    private String status = "ACTIVE"; // Default status
    private String userId; // User who created the post
}