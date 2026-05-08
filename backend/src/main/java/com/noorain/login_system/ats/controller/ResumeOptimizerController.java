package com.noorain.login_system.ats.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.noorain.login_system.ats.dto.ResumeOptimizationHistoryItem;
import com.noorain.login_system.ats.dto.ResumeOptimizationResponse;
import com.noorain.login_system.ats.entity.ResumeOptimization;
import com.noorain.login_system.ats.repository.ResumeOptimizationRepository;
import com.noorain.login_system.ats.service.ResumeOptimizerService;
import com.noorain.login_system.model.User;
import com.noorain.login_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/resume-optimizer")
@RequiredArgsConstructor
public class ResumeOptimizerController {

    private final ResumeOptimizerService resumeOptimizerService;
    private final ResumeOptimizationRepository resumeOptimizationRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @PostMapping(value = "/optimize", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResumeOptimizationResponse> optimize(
            @RequestPart("resume") MultipartFile resume,
            @RequestPart("jobDescriptionText") String jobDescriptionText,
            Authentication authentication) {
        User user = requireCurrentUser(authentication);
        return ResponseEntity.ok(resumeOptimizerService.optimize(resume, jobDescriptionText, user));
    }

    @GetMapping("/history")
    public ResponseEntity<java.util.List<ResumeOptimizationHistoryItem>> history(
            Authentication authentication,
            @RequestParam(value = "limit", defaultValue = "10") int limit) {
        User user = requireCurrentUser(authentication);
        int safeLimit = Math.max(1, Math.min(50, limit));

        var records = resumeOptimizationRepository.findByUser_IdOrderByCreatedAtDesc(
                user.getId(),
                PageRequest.of(0, safeLimit));

        var items = records.stream().map(ResumeOptimizerController::toHistoryItem).toList();
        return ResponseEntity.ok(items);
    }

    @GetMapping("/history/{id}")
    public ResponseEntity<ResumeOptimizationResponse> historyItem(
            @PathVariable("id") Long id,
            Authentication authentication) {
        User user = requireCurrentUser(authentication);

        ResumeOptimization record = resumeOptimizationRepository.findByIdAndUser_Id(id, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Optimization not found"));

        ResumeOptimizationResponse response = readStoredResponse(record);
        response.setId(record.getId());
        response.setCreatedAt(record.getCreatedAt());

        if (response.getMetadata() == null)
            response.setMetadata(new java.util.LinkedHashMap<>());
        response.getMetadata().put("saved", true);
        response.getMetadata().put("optimizationId", record.getId());
        response.getMetadata().put("createdAt",
                record.getCreatedAt() == null ? null : record.getCreatedAt().toString());
        response.getMetadata().put("resumeFilename", record.getResumeFilename());

        return ResponseEntity.ok(response);
    }

    private ResumeOptimizationResponse readStoredResponse(ResumeOptimization record) {
        if (record.getResponseJson() != null && !record.getResponseJson().isBlank()) {
            try {
                return objectMapper.readValue(record.getResponseJson(), ResumeOptimizationResponse.class);
            } catch (Exception ignored) {
                // fall through
            }
        }

        return ResumeOptimizationResponse.builder()
                .overallScore(record.getOverallScore())
                .matchScore(record.getMatchScore())
                .optimizedResumeText(record.getOptimizedResumeText())
                .metadata(new java.util.LinkedHashMap<>())
                .build();
    }

    private User requireCurrentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized"));
    }

    private static ResumeOptimizationHistoryItem toHistoryItem(ResumeOptimization record) {
        return ResumeOptimizationHistoryItem.builder()
                .id(record.getId())
                .createdAt(record.getCreatedAt())
                .resumeFilename(record.getResumeFilename())
                .overallScore(record.getOverallScore())
                .matchScore(record.getMatchScore())
                .build();
    }
}
