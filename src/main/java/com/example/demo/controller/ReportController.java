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
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "${app.cors.allowed-origins}", allowCredentials = "true")
public class ReportController {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private PostRepository postRepository;

    @PostMapping("/reports")
    public ResponseEntity<?> createReport(@Valid @RequestBody ReportRequest reportRequest) {
        try {
            // Log the request details for debugging
            System.out.println("Creating report with postId: " + reportRequest.getPostId() + 
                               ", reportedByUserId: " + reportRequest.getReportedByUserId());
            
            // First try with the ID as is
            Optional<Post> postOpt = postRepository.findById(reportRequest.getPostId());
            
            // If post not found, try with the _id field
            Post post;
            if (postOpt.isPresent()) {
                post = postOpt.get();
            } else {
                // Log the issue
                System.out.println("Post not found with direct ID: " + reportRequest.getPostId() + 
                                  " - trying alternative lookup methods");
                
                // Fallback to get the post by checking all posts (not efficient but helps diagnose the issue)
                List<Post> allPosts = postRepository.findAll();
                Optional<Post> matchingPost = allPosts.stream()
                    .filter(p -> reportRequest.getPostId().equals(p.getId()))
                    .findFirst();
                
                if (matchingPost.isPresent()) {
                    post = matchingPost.get();
                    System.out.println("Found post via alternative lookup: " + post.getId());
                } else {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(Map.of("error", "Post not found with ID: " + reportRequest.getPostId()));
                }
            }

            // Check if user has already reported this post
            List<Report> existingReports = reportRepository.findByPostIdAndReportedByUserId(
                    reportRequest.getPostId(), reportRequest.getReportedByUserId());
            if (!existingReports.isEmpty()) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("error", "You have already reported this post"));
            }

            // Create new report
            Report report = new Report();
            report.setPostId(post.getId()); // Use the consistent ID
            report.setReportedByUserId(reportRequest.getReportedByUserId());
            report.setReason(reportRequest.getReason());
            report.setDescription(reportRequest.getDescription());
            report.setReportedAt(LocalDateTime.now());
            report.setStatus("PENDING");

            // Increment report count on post - Handle case where reportCount might be null
            int currentCount = post.getReportCount();
            post.setReportCount(currentCount + 1);
            postRepository.save(post);

            // Save report
            Report savedReport = reportRepository.save(report);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedReport);
        } catch (Exception e) {
            // Log the error for server-side debugging
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create report: " + e.getMessage()));
        }
    }
    
    @GetMapping("/reports/user/{userId}")
    public ResponseEntity<?> getReportsByUserId(@PathVariable String userId) {
        List<Report> reports = reportRepository.findByReportedByUserId(userId);
        return ResponseEntity.ok(reports);
    }

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