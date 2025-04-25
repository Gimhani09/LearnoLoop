package com.example.demo.controller;

import com.example.demo.dto.AdminReportAction;
import com.example.demo.exception.ReportNotFoundException;
import com.example.demo.model.Post;
import com.example.demo.model.Report;
import com.example.demo.repository.PostRepository;
import com.example.demo.repository.ReportRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class AdminController {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private PostRepository postRepository;

    @GetMapping("/reports")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Report>> getAllReports() {
        List<Report> reports = reportRepository.findAll();
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/reports/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Report>> getPendingReports() {
        List<Report> reports = reportRepository.findByStatus("PENDING");
        return ResponseEntity.ok(reports);
    }

    @PutMapping("/reports/action")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> handleReportAction(
            @Valid @RequestBody AdminReportAction action,
            Authentication authentication) {
        
        Report report = reportRepository.findById(action.getReportId())
                .orElseThrow(() -> new ReportNotFoundException("Report not found with ID: " + action.getReportId()));

        if (!"PENDING".equals(report.getStatus())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Report is not in PENDING state"));
        }

        if (!"APPROVE".equals(action.getAction()) && !"REJECT".equals(action.getAction())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid action. Must be either APPROVE or REJECT"));
        }

        // Update report status
        report.setStatus(action.getAction());
        report.setAdminComment(action.getAdminComment());
        report.setReviewedAt(LocalDateTime.now());
        report.setReviewedByAdminId(authentication.getName());

        // If approved, update post status
        if ("APPROVE".equals(action.getAction())) {
            Post post = postRepository.findById(report.getPostId())
                    .orElseThrow(() -> new IllegalArgumentException("Associated post not found"));
            post.setStatus("REMOVED");
            postRepository.save(post);
        }

        Report updatedReport = reportRepository.save(report);
        return ResponseEntity.ok(updatedReport);
    }
} 