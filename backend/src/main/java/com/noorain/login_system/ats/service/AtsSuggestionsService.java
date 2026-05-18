package com.noorain.login_system.ats.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.noorain.login_system.ats.ai.AiClient;
import com.noorain.login_system.ats.ai.AiResult;
import com.noorain.login_system.ats.dto.AtsScoreResponse;
import com.noorain.login_system.ats.dto.AtsSuggestionsResponse;
import com.noorain.login_system.ats.extraction.DocumentTextExtractor;
import com.noorain.login_system.ats.scoring.AtsScoringEngine;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@Service
@RequiredArgsConstructor
public class AtsSuggestionsService {

    private final DocumentTextExtractor extractor;
    private final AtsScoringEngine scoringEngine;
    private final AiClient aiClient;
    private final ObjectMapper objectMapper;

    @Value("${app.ats.suggestions.ai-enabled:false}")
    private boolean aiEnabled;

    public AtsSuggestionsResponse suggest(MultipartFile resumeFile, String jobDescriptionText) {
        if (resumeFile == null || resumeFile.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Resume file is required");
        }
        if (jobDescriptionText == null || jobDescriptionText.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Job description is required");
        }

        String resumeText = extractor.extractText(resumeFile);
        AtsScoreResponse report = scoringEngine.score(resumeText, jobDescriptionText);

        List<String> top = safeList(report.getTopJobKeywords());
        List<String> mustHaves = top.subList(0, Math.min(10, top.size()));
        List<String> niceToHaves = top.subList(Math.min(10, top.size()), Math.min(25, top.size()));

        Set<String> missingSet = new HashSet<>(safeList(report.getMissingKeywords()));
        List<String> missingMust = mustHaves.stream().filter(missingSet::contains).toList();
        List<String> missingNice = niceToHaves.stream().filter(missingSet::contains).toList();

        Map<String, Object> meta = new LinkedHashMap<>();
        meta.put("jobDescriptionProvided", true);

        AiSuggestion aiSuggestion = aiEnabled
                ? generateAiSuggestion(resumeText, jobDescriptionText, report, meta)
                : null;
        List<String> edits = aiSuggestion == null ? mergeSuggestions(report) : aiSuggestion.resumeEdits();
        List<String> rewrites = aiSuggestion == null ? List.of() : aiSuggestion.bulletRewrites();

        if (aiSuggestion == null) {
            meta.put("aiEnabled", false);
            meta.put("source", "rules");
        } else {
            meta.put("aiEnabled", true);
            meta.put("source", "ai");
        }

        return AtsSuggestionsResponse.builder()
                .mustHaves(mustHaves)
                .niceToHaves(niceToHaves)
                .missingMustHaves(missingMust)
                .missingNiceToHaves(missingNice)
                .resumeEdits(edits)
                .bulletRewrites(rewrites)
                .metadata(meta)
                .build();
    }

    private AiSuggestion generateAiSuggestion(
            String resumeText,
            String jobDescriptionText,
            AtsScoreResponse report,
            Map<String, Object> meta) {
        AiResult result = aiClient.generateJson("""
                You are an ATS resume coach. Return strict JSON only:
                {"resumeEdits":["edit 1","edit 2","edit 3"],"bulletRewrites":["rewrite 1","rewrite 2","rewrite 3"]}

                Missing keywords: %s
                Priority fixes: %s
                Job description: %s
                Resume text: %s
                """.formatted(
                safeList(report.getMissingKeywords()).subList(0,
                        Math.min(12, safeList(report.getMissingKeywords()).size())),
                safeList(report.getPriorityFixes()),
                truncate(jobDescriptionText, 1200),
                truncate(resumeText, 1600)));

        if (result != null && result.getMetadata() != null) {
            meta.putAll(result.getMetadata());
        }
        if (result == null || result.getJson() == null || result.getJson().isBlank()) {
            return null;
        }

        try {
            JsonNode root = objectMapper.readTree(stripCodeFence(result.getJson()));
            List<String> resumeEdits = readStringArray(root.path("resumeEdits"), 5);
            List<String> bulletRewrites = readStringArray(root.path("bulletRewrites"), 3);
            if (resumeEdits.isEmpty() && bulletRewrites.isEmpty())
                return null;
            if (resumeEdits.isEmpty())
                resumeEdits = mergeSuggestions(report);
            return new AiSuggestion(resumeEdits, bulletRewrites);
        } catch (Exception e) {
            return null;
        }
    }

    private static List<String> safeList(List<String> items) {
        return items == null ? List.of() : items;
    }

    private static List<String> mergeSuggestions(AtsScoreResponse report) {
        LinkedHashSet<String> out = new LinkedHashSet<>();
        for (String s : safeList(report.getPriorityFixes())) {
            String t = safeTrim(s);
            if (t != null)
                out.add(t);
        }
        for (String s : safeList(report.getRecommendations())) {
            String t = safeTrim(s);
            if (t != null)
                out.add(t);
        }
        List<String> merged = new ArrayList<>(out);
        return merged.subList(0, Math.min(10, merged.size()));
    }

    private static String safeTrim(String value) {
        if (value == null)
            return null;
        String t = value.trim();
        return t.isBlank() ? null : t;
    }

    private static List<String> readStringArray(JsonNode node, int max) {
        List<String> values = new ArrayList<>();
        if (!node.isArray())
            return values;
        for (JsonNode item : node) {
            String value = safeTrim(item.asText(""));
            if (value != null)
                values.add(value);
            if (values.size() == max)
                break;
        }
        return values;
    }

    private static String stripCodeFence(String value) {
        String text = value.trim();
        if (!text.startsWith("```"))
            return text;
        text = text.replaceFirst("^```(?:json)?\\s*", "");
        return text.replaceFirst("\\s*```$", "").trim();
    }

    private static String truncate(String value, int max) {
        if (value == null || value.length() <= max)
            return value;
        return value.substring(0, max) + "...";
    }

    private record AiSuggestion(List<String> resumeEdits, List<String> bulletRewrites) {
    }
}
