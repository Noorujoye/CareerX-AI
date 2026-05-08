package com.noorain.login_system.ats.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AtsScoreResponse {
    /**
     * General ATS score (0..100), computed even when JD is not provided.
     */
    private int overallScore;

    /**
     * JD match score (0..100). Only meaningful when JD is provided.
     * When JD is missing, this will be null.
     */
    private Integer matchScore;

    private String summary;

    /**
     * Deterministic breakdown by category (0..100 per category).
     * Example keys: parsing, structure, keywords, readability
     */
    private Map<String, Integer> categoryScores;

    /**
     * Human-readable findings to show in UI.
     */
    private List<String> warnings;

    /**
     * Missing or weak keywords (only meaningful if JD provided).
     */
    private List<String> missingKeywords;

    /**
     * Ranked keywords from the JD that were found in the resume.
     */
    private List<String> matchedKeywords;

    /**
     * Top keywords extracted from the JD (ranked by importance).
     */
    private List<String> topJobKeywords;

    /**
     * Actionable next steps (deterministic, rules-based).
     */
    private List<String> recommendations;

    /**
     * Highest-impact fixes (top 3-6) to improve score quickly.
     */
    private List<String> priorityFixes;

    /**
     * Useful metadata for debugging/UI (do not include raw resume text).
     */
    private Map<String, Object> metadata;
}
