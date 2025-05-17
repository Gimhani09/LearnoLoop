package com.example.demo.service;

import com.example.demo.model.Notification;
import com.example.demo.model.User;
import com.example.demo.repository.NotificationRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private UserRepository userRepository;

    public List<Notification> getNotificationsByUserId(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    public Page<Notification> getNotificationsByUserIdPaginated(String userId, Pageable pageable) {
        return notificationRepository.findByUserId(userId, pageable);
    }
    
    public long countUnreadNotifications(String userId) {
        return notificationRepository.countByUserIdAndIsRead(userId, false);
    }
    
    public Notification createNotification(String userId, String actorId, String type, String entityId, String content) {
        Optional<User> actorOptional = userRepository.findById(actorId);
        if (actorOptional.isEmpty()) {
            return null;
        }
        
        User actor = actorOptional.get();
        
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setActorId(actorId);
        notification.setActorName(actor.getName());
        notification.setActorImageUrl(actor.getProfilePictureUrl());
        notification.setType(type);
        notification.setEntityId(entityId);
        notification.setContent(content);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        
        return notificationRepository.save(notification);
    }
    
    public Notification markAsRead(String id) {
        Optional<Notification> notificationOptional = notificationRepository.findById(id);
        
        if (notificationOptional.isPresent()) {
            Notification notification = notificationOptional.get();
            notification.setRead(true);
            return notificationRepository.save(notification);
        }
        
        return null;
    }
    
    public List<Notification> markAllAsRead(String userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        
        for (Notification notification : notifications) {
            notification.setRead(true);
        }
        
        return notificationRepository.saveAll(notifications);
    }
}
