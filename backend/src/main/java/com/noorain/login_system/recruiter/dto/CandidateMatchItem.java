package com.noorain.login_system.recruiter.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateMatchItem {
    private String candidateName;
    private String resumeFilename;
    private int overallScore;
    private Integer matchScore;
    private List<String> matchedKeywords;
    private List<String> missingKeywords;
    private List<String> priorityFixes;
    private String summary;
}
