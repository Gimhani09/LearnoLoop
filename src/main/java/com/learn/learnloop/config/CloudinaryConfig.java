package com.example.demo.config;

import com.cloudinary.Cloudinary;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class CloudinaryConfig {
    
    private final String CLOUD_NAME = "dunubjxtb";
    private final String API_KEY = "398176235155767";
    private final String API_SECRET = "Bte7hV6vpucwiZMfiBYbPUljHB0";
    
    @Bean
    public Cloudinary cloudinary() {
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", CLOUD_NAME);
        config.put("api_key", API_KEY);
        config.put("api_secret", API_SECRET);
        config.put("secure", "true");
        
        return new Cloudinary(config);
    }
}