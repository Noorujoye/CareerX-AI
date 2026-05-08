package com.noorain.login_system.ats.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.noorain.login_system.ats.dto.AtsScoreResponse;
import com.noorain.login_system.ats.dto.AtsScoreHistoryItem;
import com.noorain.login_system.ats.dto.AtsSuggestionsResponse;
import com.noorain.login_system.ats.entity.AtsScoreReport;
import com.noorain.login_system.ats.repository.AtsScoreReportRepository;
import com.noorain.login_system.ats.service.AtsScoreService;
import com.noorain.login_system.ats.service.AtsSuggestionsService;
import lombok.RequiredArgsConstructor;
import com.noorain.login_system.model.User;
import com.noorain.login_system.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/ats")
@RequiredArgsConstructor
public class AtsScoreController {

    private final AtsScoreService atsScoreService;

    private final AtsSuggestionsService atsSuggestionsService;
    private final UserRepository userRepository;
    private final AtsScoreReportRepository atsScoreReportRepository;
    private final ObjectMapper objectMapper;

    @PostMapping(value = "/score", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AtsScoreResponse> score(
            @RequestPart("resume") MultipartFile resume,
            @RequestPart(value = "jobDescriptionText", required = false) String jobDescriptionText,
            Authentication authentication) {
        User user = resolveCurrentUser(authentication);
        return ResponseEntity.ok(atsScoreService.score(resume, jobDescriptionText, user));
    }

    @PostMapping(value = "/suggestions", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AtsSuggestionsResponse> suggestions(
            @RequestPart("resume") MultipartFile resume,
            @RequestPart(value = "jobDescriptionText") String jobDescriptionText) {
        return ResponseEntity.ok(atsSuggestionsService.suggest(resume, jobDescriptionText));
    }

    @GetMapping("/history")
    public ResponseEntity<java.util.List<AtsScoreHistoryItem>> history(
            Authentication authentication,
            @RequestParam(value = "limit", defaultValue = "10") int limit) {
        User user = requireCurrentUser(authentication);
        int safeLimit = Math.max(1, Math.min(50, limit));

        var reports = atsScoreReportRepository.findByUser_IdOrderByCreatedAtDesc(
                user.getId(),
                PageRequest.of(0, safeLimit));

        var items = reports.stream().map(AtsScoreController::toHistoryItem).toList();
        return ResponseEntity.ok(items);
    }

    @GetMapping("/history/{id}")
    public ResponseEntity<AtsScoreResponse> historyItem(
            @PathVariable("id") Long id,
            Authentication authentication) {
        User user = requireCurrentUser(authentication);

        AtsScoreReport report = atsScoreReportRepository.findByIdAndUser_Id(id, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Report not found"));

        AtsScoreResponse response;
        try {
            response = objectMapper.readValue(report.getReportJson(), AtsScoreResponse.class);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not read stored report");
        }

        if (response.getMetadata() == null)
            response.setMetadata(new java.util.LinkedHashMap<>());
        response.getMetadata().put("saved", true);
        response.getMetadata().put("reportId", report.getId());
        response.getMetadata().put("createdAt",
                report.getCreatedAt() == null ? null : report.getCreatedAt().toString());
        response.getMetadata().put("resumeFilename", report.getResumeFilename());
        response.getMetadata().put("jobDescriptionProvided",
                report.getJobDescriptionText() != null && !report.getJobDescriptionText().isBlank());

        return ResponseEntity.ok(response);
    }

    private User resolveCurrentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            return null;
        }
        return userRepository.findByEmail(authentication.getName()).orElse(null);
    }

    private User requireCurrentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized"));
    }

    private static AtsScoreHistoryItem toHistoryItem(AtsScoreReport report) {
        boolean jdProvided = report.getJobDescriptionText() != null && !report.getJobDescriptionText().isBlank();
        return AtsScoreHistoryItem.builder()
                .id(report.getId())
                .createdAt(report.getCreatedAt())
                .resumeFilename(report.getResumeFilename())
                .jobDescriptionProvided(jdProvided)
                .overallScore(report.getOverallScore())
                .matchScore(report.getMatchScore())
                .build();
    }
}
