package com.example.demo.service;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }
    
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public User createUser(User user) {
        return userRepository.save(user);
    }

    public User updateUser(String id, User user) {
        user.setId(id);
        return userRepository.save(user);
    }

    public void deleteUser(String id) {
        userRepository.deleteById(id);
    }
    
    public User followUser(String userId, String followId) {
        Optional<User> userOptional = userRepository.findById(userId);
        Optional<User> followOptional = userRepository.findById(followId);
        
        if (userOptional.isPresent() && followOptional.isPresent()) {
            User user = userOptional.get();
            User followUser = followOptional.get();
            
            if (!user.getFollowing().contains(followId)) {
                // Add to following list
                user.getFollowing().add(followId);
                userRepository.save(user);
                
                // Add to followers list of the followed user
                followUser.getFollowers().add(userId);
                userRepository.save(followUser);
            }
            
            return user;
        }
        
        return null;
    }
    
    public User unfollowUser(String userId, String unfollowId) {
        Optional<User> userOptional = userRepository.findById(userId);
        Optional<User> unfollowOptional = userRepository.findById(unfollowId);
        
        if (userOptional.isPresent() && unfollowOptional.isPresent()) {
            User user = userOptional.get();
            User unfollowUser = unfollowOptional.get();
            
            // Remove from following list
            user.getFollowing().remove(unfollowId);
            userRepository.save(user);
            
            // Remove from followers list of the unfollowed user
            unfollowUser.getFollowers().remove(userId);
            userRepository.save(unfollowUser);
            
            return user;
        }
        
        return null;
    }
}
