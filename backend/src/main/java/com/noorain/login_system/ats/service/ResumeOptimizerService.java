package com.noorain.login_system.ats.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.noorain.login_system.ats.dto.AtsScoreResponse;
import com.noorain.login_system.ats.dto.ResumeOptimizationResponse;
import com.noorain.login_system.ats.entity.ResumeOptimization;
import com.noorain.login_system.ats.extraction.DocumentTextExtractor;
import com.noorain.login_system.ats.repository.ResumeOptimizationRepository;
import com.noorain.login_system.ats.scoring.AtsScoringEngine;
import com.noorain.login_system.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ResumeOptimizerService {

    private static final long MAX_BYTES = 3L * 1024 * 1024;
    private static final int MAX_SUGGESTED_KEYWORDS = 18;

    private final DocumentTextExtractor extractor;
    private final AtsScoringEngine scoringEngine;
    private final ResumeOptimizationRepository resumeOptimizationRepository;
    private final ObjectMapper objectMapper;

    public ResumeOptimizationResponse optimize(MultipartFile resumeFile, String jobDescriptionText, User user) {
        if (resumeFile == null || resumeFile.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Resume file is required");
        }
        if (resumeFile.getSize() > MAX_BYTES) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "Resume must be 3MB or less");
        }
        if (jobDescriptionText == null || jobDescriptionText.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Job description is required");
        }

        String originalName = resumeFile.getOriginalFilename();
        String filename = originalName == null ? "" : originalName.toLowerCase(Locale.ROOT);
        if (!(filename.endsWith(".pdf") || filename.endsWith(".docx") || filename.endsWith(".doc"))) {
            throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                    "Unsupported file type. Please upload PDF, DOC, or DOCX.");
        }

        String resumeText = extractor.extractText(resumeFile);
        AtsScoreResponse report = scoringEngine.score(resumeText, jobDescriptionText);

        List<String> missingKeywords = report.getMissingKeywords() == null ? List.of() : report.getMissingKeywords();
        String optimizedText = buildOptimizedResumeText(resumeText, missingKeywords);

        Map<String, Object> meta = new LinkedHashMap<>();
        meta.put("jobDescriptionProvided", true);

        ResumeOptimizationResponse response = ResumeOptimizationResponse.builder()
                .overallScore(report.getOverallScore())
                .matchScore(report.getMatchScore())
                .summary(report.getSummary())
                .missingKeywords(missingKeywords)
                .matchedKeywords(report.getMatchedKeywords())
                .topJobKeywords(report.getTopJobKeywords())
                .priorityFixes(report.getPriorityFixes())
                .recommendations(report.getRecommendations())
                .optimizedResumeText(optimizedText)
                .metadata(meta)
                .build();

        if (user != null) {
            ResumeOptimization saved = persist(user, originalName, resumeText, jobDescriptionText, response);
            response.setId(saved.getId());
            response.setCreatedAt(saved.getCreatedAt());
            response.getMetadata().put("saved", true);
            response.getMetadata().put("optimizationId", saved.getId());
            response.getMetadata().put("createdAt",
                    saved.getCreatedAt() == null ? null : saved.getCreatedAt().toString());
        } else {
            response.getMetadata().put("saved", false);
        }

        return response;
    }

    private ResumeOptimization persist(User user,
            String originalFilename,
            String resumeText,
            String jobDescriptionText,
            ResumeOptimizationResponse response) {
        String responseJson;
        try {
            responseJson = objectMapper.writeValueAsString(response);
        } catch (Exception e) {
            responseJson = "{}";
        }

        ResumeOptimization entity = ResumeOptimization.builder()
                .user(user)
                .resumeFilename(originalFilename)
                .resumeText(resumeText == null ? "" : resumeText)
                .jobDescriptionText(jobDescriptionText)
                .overallScore(response.getOverallScore())
                .matchScore(response.getMatchScore())
                .optimizedResumeText(response.getOptimizedResumeText() == null ? "" : response.getOptimizedResumeText())
                .responseJson(responseJson)
                .createdAt(Instant.now())
                .build();

        return resumeOptimizationRepository.save(entity);
    }

    private static String buildOptimizedResumeText(String resumeText, List<String> missingKeywords) {
        String base = resumeText == null ? "" : resumeText.trim();
        if (missingKeywords == null || missingKeywords.isEmpty()) {
            return base;
        }

        List<String> topMissing = missingKeywords.subList(0, Math.min(MAX_SUGGESTED_KEYWORDS, missingKeywords.size()));

        StringBuilder sb = new StringBuilder();
        sb.append(base);
        if (!base.isEmpty() && !base.endsWith("\n"))
            sb.append("\n");
        sb.append("\n");
        sb.append("Skills (Add only if true)\n");
        for (String kw : topMissing) {
            if (kw == null || kw.isBlank())
                continue;
            sb.append("- ").append(kw.trim()).append("\n");
        }

        return sb.toString().trim();
    }
}
