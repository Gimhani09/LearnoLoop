package com.learn.learnloop.config;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.lang.NonNull;

import java.util.concurrent.TimeUnit;

@Configuration
@EnableMongoRepositories(basePackages = "com.learn.learnloop.repository")
public class MongoConfig extends AbstractMongoClientConfiguration {

    @Value("${spring.data.mongodb.uri}")
    private String mongoUri;
    
    private static final int CONNECTION_TIMEOUT = 30000; // 30 seconds
    private static final int MAX_CONNECTION_IDLE_TIME = 60000; // 60 seconds
    private static final int MAX_CONNECTIONS_PER_HOST = 50;
    
    @Override
    @NonNull
    protected String getDatabaseName() {
        // Extract database name from URI
        String dbName = "productdb"; // Default name
        
        if (mongoUri != null && !mongoUri.isEmpty()) {
            // Parse the MongoDB URI to extract database name
            try {
                ConnectionString connectionString = new ConnectionString(mongoUri);
                if (connectionString.getDatabase() != null) {
                    dbName = connectionString.getDatabase();
                }
            } catch (Exception e) {
                System.err.println("Error parsing MongoDB URI: " + e.getMessage());
            }
        }
        
        return dbName;
    }
    
    @Override
    @Bean
    @NonNull
    public MongoClient mongoClient() {
        ConnectionString connectionString = new ConnectionString(mongoUri);
        
        MongoClientSettings mongoClientSettings = MongoClientSettings.builder()
            .applyConnectionString(connectionString)
            .applyToSocketSettings(builder -> 
                builder.connectTimeout(CONNECTION_TIMEOUT, TimeUnit.MILLISECONDS))
            .applyToConnectionPoolSettings(builder -> 
                builder.maxConnectionIdleTime(MAX_CONNECTION_IDLE_TIME, TimeUnit.MILLISECONDS)
                       .maxSize(MAX_CONNECTIONS_PER_HOST))
            .build();
        
        return MongoClients.create(mongoClientSettings);
    }
    
    @Bean
    public MongoTemplate mongoTemplate() {
        return new MongoTemplate(mongoClient(), getDatabaseName());
    }
}