package com.noorain.login_system.ats.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeOptimizationResponse {

    private Long id;
    private Instant createdAt;

    private int overallScore;
    private Integer matchScore;
    private String summary;

    private List<String> missingKeywords;
    private List<String> matchedKeywords;
    private List<String> topJobKeywords;

    private List<String> priorityFixes;
    private List<String> recommendations;

    /**
     * Deterministic, rules-based “optimized” version of the resume text.
     * This does not invent experience; it only suggests where to add
     * keywords/sections.
     */
    private String optimizedResumeText;

    private Map<String, Object> metadata;
}
