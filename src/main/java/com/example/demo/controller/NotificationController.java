package com.example.demo.controller;

import com.example.demo.model.Notification;
import com.example.demo.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getNotificationsByUserId(@PathVariable String userId) {
        return new ResponseEntity<>(notificationService.getNotificationsByUserId(userId), HttpStatus.OK);
    }
    
    @GetMapping("/user/{userId}/paginated")
    public ResponseEntity<Page<Notification>> getNotificationsByUserIdPaginated(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return new ResponseEntity<>(notificationService.getNotificationsByUserIdPaginated(userId, pageable), HttpStatus.OK);
    }
    
    @GetMapping("/user/{userId}/count")
    public ResponseEntity<Map<String, Long>> countUnreadNotifications(@PathVariable String userId) {
        Map<String, Long> response = new HashMap<>();
        response.put("count", notificationService.countUnreadNotifications(userId));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
    
    @PostMapping("/create")
    public ResponseEntity<Notification> createNotification(
            @RequestParam String userId,
            @RequestParam String actorId,
            @RequestParam String type,
            @RequestParam String entityId,
            @RequestParam String content) {
        Notification notification = notificationService.createNotification(userId, actorId, type, entityId, content);
        if (notification != null) {
            return new ResponseEntity<>(notification, HttpStatus.CREATED);
        }
        return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    }
    
    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable String id) {
        Notification notification = notificationService.markAsRead(id);
        if (notification != null) {
            return new ResponseEntity<>(notification, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
    
    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<List<Notification>> markAllAsRead(@PathVariable String userId) {
        return new ResponseEntity<>(notificationService.markAllAsRead(userId), HttpStatus.OK);
    }
}
