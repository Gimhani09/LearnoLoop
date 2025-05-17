package com.example.pafapp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

@Configuration
public class CloudinaryConfig {
    
    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
            "cloud_name", "dp7jiqfiy",
            "api_key", "381917828662931",
            "api_secret", "n06aKlo3s1thFkP2qZ5pAVKA3bU"
        ));
    }
}
