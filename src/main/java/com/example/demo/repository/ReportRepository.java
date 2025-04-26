package com.example.demo.repository;

import com.example.demo.model.Report;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReportRepository extends MongoRepository<Report, String> {
    List<Report> findByStatus(String status);
    List<Report> findByEntityTypeAndEntityId(String entityType, String entityId);
    List<Report> findByReporterId(String reporterId);
}
