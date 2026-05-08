package com.noorain.login_system.ats.service;

import com.noorain.login_system.ats.dto.AtsScoreResponse;
import com.noorain.login_system.ats.dto.AtsSuggestionsResponse;
import com.noorain.login_system.ats.extraction.DocumentTextExtractor;
import com.noorain.login_system.ats.scoring.AtsScoringEngine;
import lombok.RequiredArgsConstructor;
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

        List<String> edits = mergeSuggestions(report);

        Map<String, Object> meta = new LinkedHashMap<>();
        meta.put("jobDescriptionProvided", true);
        meta.put("aiEnabled", false);
        meta.put("source", "rules");

        return AtsSuggestionsResponse.builder()
                .mustHaves(mustHaves)
                .niceToHaves(niceToHaves)
                .missingMustHaves(missingMust)
                .missingNiceToHaves(missingNice)
                .resumeEdits(edits)
                .bulletRewrites(List.of())
                .metadata(meta)
                .build();
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
}
