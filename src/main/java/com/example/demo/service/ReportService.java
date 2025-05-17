package com.example.demo.service;

import com.example.demo.model.Report;
import com.example.demo.repository.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ReportService {

    @Autowired
    private ReportRepository reportRepository;

    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }
    
    public List<Report> getReportsByStatus(String status) {
        return reportRepository.findByStatus(status);
    }
    
    public List<Report> getReportsByEntity(String entityType, String entityId) {
        return reportRepository.findByEntityTypeAndEntityId(entityType, entityId);
    }
    
    public List<Report> getReportsByReporter(String reporterId) {
        return reportRepository.findByReporterId(reporterId);
    }

    public Optional<Report> getReportById(String id) {
        return reportRepository.findById(id);
    }

    public Report createReport(Report report) {
        report.setStatus("PENDING");
        report.setCreatedAt(LocalDateTime.now());
        report.setUpdatedAt(LocalDateTime.now());
        return reportRepository.save(report);
    }

    public Report updateReportStatus(String id, String status, String adminNote) {
        Optional<Report> existingReport = reportRepository.findById(id);
        
        if (existingReport.isPresent()) {
            Report report = existingReport.get();
            report.setStatus(status);
            report.setAdminNote(adminNote);
            report.setUpdatedAt(LocalDateTime.now());
            return reportRepository.save(report);
        }
        
        return null;
    }
}
