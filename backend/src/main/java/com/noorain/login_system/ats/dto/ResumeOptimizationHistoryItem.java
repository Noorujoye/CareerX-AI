package com.noorain.login_system.ats.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeOptimizationHistoryItem {
    private Long id;
    private Instant createdAt;
    private String resumeFilename;
    private int overallScore;
    private Integer matchScore;
}
