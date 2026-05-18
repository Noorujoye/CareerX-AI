package com.noorain.login_system.recruiter.service;

import com.noorain.login_system.ats.dto.AtsScoreResponse;
import com.noorain.login_system.ats.extraction.DocumentTextExtractor;
import com.noorain.login_system.ats.scoring.AtsScoringEngine;
import com.noorain.login_system.recruiter.dto.CandidateMatchItem;
import com.noorain.login_system.recruiter.dto.CandidateMatchResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RecruiterMatchService {
    private static final long MAX_FILE_BYTES = 3L * 1024 * 1024;
    private static final int MAX_FILES = 25;

    private final DocumentTextExtractor extractor;
    private final AtsScoringEngine scoringEngine;

    public CandidateMatchResponse match(String role, String jobDescriptionText, List<MultipartFile> resumes) {
        if (jobDescriptionText == null || jobDescriptionText.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Job description is required");
        }
        if (resumes == null || resumes.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one resume is required");
        }
        if (resumes.size() > MAX_FILES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Upload up to 25 resumes at a time");
        }

        List<CandidateMatchItem> candidates = resumes.stream()
                .filter(file -> file != null && !file.isEmpty())
                .map(file -> scoreCandidate(file, jobDescriptionText))
                .sorted(Comparator
                        .comparing((CandidateMatchItem item) -> item.getMatchScore() == null ? 0 : item.getMatchScore())
                        .thenComparing(CandidateMatchItem::getOverallScore)
                        .reversed())
                .toList();

        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("count", candidates.size());
        metadata.put("rankedBy", "matchScore");

        return CandidateMatchResponse.builder()
                .role(role == null || role.isBlank() ? "Open role" : role.trim())
                .candidates(candidates)
                .metadata(metadata)
                .build();
    }

    private CandidateMatchItem scoreCandidate(MultipartFile file, String jobDescriptionText) {
        validateResume(file);
        String text = extractor.extractText(file);
        AtsScoreResponse report = scoringEngine.score(text, jobDescriptionText);
        String filename = file.getOriginalFilename() == null ? "resume" : file.getOriginalFilename();

        return CandidateMatchItem.builder()
                .candidateName(candidateNameFromFilename(filename))
                .resumeFilename(filename)
                .overallScore(report.getOverallScore())
                .matchScore(report.getMatchScore())
                .matchedKeywords(limit(report.getMatchedKeywords(), 12))
                .missingKeywords(limit(report.getMissingKeywords(), 12))
                .priorityFixes(limit(report.getPriorityFixes(), 3))
                .summary(report.getSummary())
                .build();
    }

    private static void validateResume(MultipartFile file) {
        if (file.getSize() > MAX_FILE_BYTES) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "Each resume must be 3MB or less");
        }
        String filename = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase(Locale.ROOT);
        if (!(filename.endsWith(".pdf") || filename.endsWith(".docx") || filename.endsWith(".doc"))) {
            throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                    "Unsupported file type. Please upload PDF, DOC, or DOCX.");
        }
    }

    private static List<String> limit(List<String> values, int max) {
        if (values == null || values.isEmpty()) return List.of();
        return values.subList(0, Math.min(max, values.size()));
    }

    private static String candidateNameFromFilename(String filename) {
        String cleaned = filename.replaceFirst("\\.[^.]+$", "")
                .replaceAll("(?i)resume|cv|ats", "")
                .replaceAll("[_\\-]+", " ")
                .replaceAll("\\s+", " ")
                .trim();
        return cleaned.isBlank() ? "Candidate" : cleaned;
    }
}
