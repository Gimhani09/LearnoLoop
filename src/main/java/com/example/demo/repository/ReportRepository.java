package com.example.demo.repository;

import com.example.demo.model.Report;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ReportRepository extends MongoRepository<Report, String> {
    List<Report> findByPostId(String postId);
    List<Report> findByStatus(String status);
    List<Report> findByPostIdAndReportedByUserId(String postId, String reportedByUserId);
} 