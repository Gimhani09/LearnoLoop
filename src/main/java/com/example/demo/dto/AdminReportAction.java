package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class AdminReportAction {
    @NotBlank(message = "Report ID is required")
    private String reportId;

    @NotBlank(message = "Action is required")
    @Pattern(regexp = "^(APPROVE|REJECT)$", message = "Action must be either APPROVE or REJECT")
    private String action;

    @NotBlank(message = "Admin comment is required")
    private String adminComment;
} 