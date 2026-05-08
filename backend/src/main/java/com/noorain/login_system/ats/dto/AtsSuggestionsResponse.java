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
public class AtsSuggestionsResponse {
    private List<String> mustHaves;
    private List<String> niceToHaves;

    /**
     * Deterministic: computed by comparing must-haves to resume text.
     */
    private List<String> missingMustHaves;

    /**
     * Deterministic: computed by comparing nice-to-haves to resume text.
     */
    private List<String> missingNiceToHaves;

    /**
     * LLM-generated suggestions (keep short, actionable).
     */
    private List<String> resumeEdits;

    /**
     * LLM-generated rewrites (3 max).
     */
    private List<String> bulletRewrites;

    /**
     * Debug metadata (provider, model, etc.) without leaking secrets.
     */
    private Map<String, Object> metadata;
}
