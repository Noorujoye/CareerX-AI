package com.noorain.login_system.ats.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.noorain.login_system.ats.dto.AtsScoreResponse;
import com.noorain.login_system.ats.entity.AtsScoreReport;
import com.noorain.login_system.ats.extraction.DocumentTextExtractor;
import com.noorain.login_system.ats.repository.AtsScoreReportRepository;
import com.noorain.login_system.ats.scoring.AtsScoringEngine;
import com.noorain.login_system.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AtsScoreService {

    public static final long MAX_BYTES = 3L * 1024 * 1024;

    private final DocumentTextExtractor extractor;
    private final AtsScoringEngine scoringEngine;
    private final AtsScoreReportRepository atsScoreReportRepository;
    private final ObjectMapper objectMapper;

    public AtsScoreResponse score(MultipartFile resumeFile, String jobDescriptionText) {
        return score(resumeFile, jobDescriptionText, null);
    }

    public AtsScoreResponse score(MultipartFile resumeFile, String jobDescriptionText, User user) {
        if (resumeFile == null || resumeFile.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Resume file is required");
        }
        if (resumeFile.getSize() > MAX_BYTES) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "Resume must be 3MB or less");
        }

        String originalName = resumeFile.getOriginalFilename();
        String filename = originalName == null ? "" : originalName.toLowerCase(Locale.ROOT);
        if (!(filename.endsWith(".pdf") || filename.endsWith(".docx") || filename.endsWith(".doc"))) {
            throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                    "Unsupported file type. Please upload PDF, DOC, or DOCX.");
        }

        String resumeText = extractor.extractText(resumeFile);
        AtsScoreResponse response = scoringEngine.score(resumeText, jobDescriptionText);

        if (user != null) {
            AtsScoreReport saved = persist(user, originalName, resumeText, jobDescriptionText, response);
            if (response.getMetadata() == null)
                response.setMetadata(new LinkedHashMap<>());
            response.getMetadata().put("saved", true);
            response.getMetadata().put("reportId", saved.getId());
            response.getMetadata().put("createdAt",
                    saved.getCreatedAt() == null ? null : saved.getCreatedAt().toString());
        } else {
            if (response.getMetadata() == null)
                response.setMetadata(new LinkedHashMap<>());
            response.getMetadata().put("saved", false);
        }

        return response;
    }

    private AtsScoreReport persist(User user,
            String originalFilename,
            String resumeText,
            String jobDescriptionText,
            AtsScoreResponse response) {
        String reportJson;
        try {
            reportJson = objectMapper.writeValueAsString(response);
        } catch (Exception e) {
            // Don't block scoring if JSON serialization fails.
            reportJson = "{}";
        }

        AtsScoreReport report = AtsScoreReport.builder()
                .user(user)
                .resumeFilename(originalFilename)
                .resumeText(resumeText == null ? "" : resumeText)
                .jobDescriptionText(jobDescriptionText)
                .overallScore(response.getOverallScore())
                .matchScore(response.getMatchScore())
                .reportJson(reportJson)
                .createdAt(Instant.now())
                .build();

        return atsScoreReportRepository.save(report);
    }
}
