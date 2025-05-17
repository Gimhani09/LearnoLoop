package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "${app.cors.allowed-origins}", allowCredentials = "true")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final SecurityContextRepository securityContextRepository = 
        new HttpSessionSecurityContextRepository();

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {
        try {
            if (userRepository.existsByUsername(user.getUsername())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Username already exists"));
            }

            user.setPassword(passwordEncoder.encode(user.getPassword()));

            // Force ADMIN role for specific username
            if ("admin".equalsIgnoreCase(user.getUsername())) {
                user.setRole("ADMIN");
            } else {
                user.setRole("USER");
            }

            User createdUser = userRepository.save(user);
            
            // Don't return password
            createdUser.setPassword(null);
            return ResponseEntity.ok(createdUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest, HttpServletRequest request, HttpServletResponse response) {
        try {
            if (loginRequest.getUsername() == null || loginRequest.getPassword() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Username and password are required"));
            }
            
            User user = userRepository.findByUsername(loginRequest.getUsername());
            
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "User not found"));
            }
            
            if (passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                // Create authentication object
                Authentication authentication = new UsernamePasswordAuthenticationToken(
                    user.getUsername(), 
                    null, // Credentials can be null after authentication
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole()))
                );
                
                // Set the authentication in the security context
                SecurityContext context = SecurityContextHolder.createEmptyContext();
                context.setAuthentication(authentication);
                SecurityContextHolder.setContext(context);
                
                // Create a session and store the security context
                HttpSession session = request.getSession(true);
                securityContextRepository.saveContext(context, request, response);
                
                // Create a response object without the password
                Map<String, Object> responseBody = new HashMap<>();
                responseBody.put("id", user.getId());
                responseBody.put("username", user.getUsername());
                responseBody.put("role", user.getRole());
                
                return ResponseEntity.ok(responseBody);
            } else {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Login failed: " + e.getMessage()));
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        try {
            HttpSession session = request.getSession(false);
            if (session != null) {
                session.invalidate();
            }
            SecurityContextHolder.clearContext();
            return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Logout failed: " + e.getMessage()));
        }
    }
    
    @GetMapping("/current-user")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        try {
            if (authentication != null && authentication.isAuthenticated()) {
                String username = authentication.getName();
                User user = userRepository.findByUsername(username);
                if (user != null) {
                    // Create a response object without the password
                    Map<String, Object> responseBody = new HashMap<>();
                    responseBody.put("id", user.getId());
                    responseBody.put("username", user.getUsername());
                    responseBody.put("role", user.getRole());
                    
                    return ResponseEntity.ok(responseBody);
                }
            }
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to get current user: " + e.getMessage()));
        }
    }
}
