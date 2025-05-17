package com.example.demo.repository;

import com.example.demo.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);
    Page<Notification> findByUserId(String userId, Pageable pageable);
    long countByUserIdAndIsRead(String userId, boolean isRead);
}
