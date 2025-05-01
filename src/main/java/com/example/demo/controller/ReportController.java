package com.example.demo.controller;

import com.example.demo.dto.ReportRequest;
import com.example.demo.model.Post;
import com.example.demo.model.Report;
import com.example.demo.repository.PostRepository;
import com.example.demo.repository.ReportRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ReportController {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private PostRepository postRepository;

    @PostMapping("/reports")
    public ResponseEntity<?> createReport(@Valid @RequestBody ReportRequest reportRequest) {
        // Validate if post exists
        Post post = postRepository.findById(reportRequest.getPostId())
                .orElseThrow(() -> new IllegalArgumentException("Post not found with ID: " + reportRequest.getPostId()));

        // Check if user has already reported this post
        List<Report> existingReports = reportRepository.findByPostIdAndReportedByUserId(
                reportRequest.getPostId(), reportRequest.getReportedByUserId());
        if (!existingReports.isEmpty()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "You have already reported this post"));
        }

        // Create new report
        Report report = new Report();
        report.setPostId(reportRequest.getPostId());
        report.setReportedByUserId(reportRequest.getReportedByUserId());
        report.setReason(reportRequest.getReason());
        report.setDescription(reportRequest.getDescription());
        report.setReportedAt(LocalDateTime.now());
        report.setStatus("PENDING");

        // Increment report count on post
        post.setReportCount(post.getReportCount() + 1);
        postRepository.save(post);

        // Save report
        Report savedReport = reportRepository.save(report);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedReport);
    }
<<<<<<< Updated upstream
=======
    
    @GetMapping("/reports/user/{userId}")
public ResponseEntity<?> getReportsByUserId(@PathVariable String userId) {
    List<Report> reports = reportRepository.findByReportedByUserId(userId);
    return ResponseEntity.ok(reports);
}
>>>>>>> Stashed changes

    @GetMapping("/reports/post/{postId}")
    public ResponseEntity<?> getReportsByPostId(@PathVariable String postId) {
        if (!postRepository.existsById(postId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Post not found with ID: " + postId));
        }
        List<Report> reports = reportRepository.findByPostId(postId);
        return ResponseEntity.ok(reports);
    }
} 