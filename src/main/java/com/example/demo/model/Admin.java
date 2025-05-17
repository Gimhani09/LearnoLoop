package com.example.demo.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;

@Data
@Document(collection = "admins")
public class Admin {
    @Id
    private String id;
    private String username;
    private String password;
    private String role = "ADMIN";
} 