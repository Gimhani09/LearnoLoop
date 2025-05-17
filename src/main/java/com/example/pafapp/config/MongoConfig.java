package com.example.pafapp.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@Configuration
@EnableMongoRepositories(basePackages = "com.example.pafapp.repository")
public class MongoConfig {
    // This configuration class ensures that all MongoDB repositories are properly scanned
}