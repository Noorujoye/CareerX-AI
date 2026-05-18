package com.noorain.login_system.interview.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.noorain.login_system.ats.ai.AiClient;
import com.noorain.login_system.ats.ai.AiResult;
import com.noorain.login_system.interview.dto.InterviewFeedbackResponse;
import com.noorain.login_system.interview.dto.InterviewQuestionResponse;
import com.noorain.login_system.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class InterviewService {
    private final AiClient aiClient;
    private final ObjectMapper objectMapper;

    public InterviewQuestionResponse questions(User user, String role, String jobDescriptionText) {
        String targetRole = normalizeRole(role, user);
        Map<String, Object> metadata = new LinkedHashMap<>();

        AiResult result = aiClient.generateJson("""
                Create interview practice for this candidate. Return strict JSON only:
                {"questions":["q1","q2","q3","q4","q5"],"focusAreas":["area1","area2","area3"]}

                Target role: %s
                Candidate skills: %s
                Candidate experience: %s
                Job description: %s
                """.formatted(targetRole, safe(user.getSkills()), truncate(safe(user.getExperience()), 800), truncate(safe(jobDescriptionText), 1200)));

        if (result != null && result.getMetadata() != null) metadata.putAll(result.getMetadata());
        InterviewQuestionResponse aiResponse = parseQuestions(result == null ? null : result.getJson(), metadata);
        if (aiResponse != null) {
            aiResponse.getMetadata().put("source", "ai");
            return aiResponse;
        }

        metadata.put("source", "rules");
        metadata.putIfAbsent("enabled", false);
        return fallbackQuestions(targetRole, metadata);
    }

    public InterviewFeedbackResponse feedback(String question, String answer, String role) {
        Map<String, Object> metadata = new LinkedHashMap<>();
        AiResult result = aiClient.generateJson("""
                Evaluate this interview answer. Return strict JSON only:
                {"score":75,"summary":"one sentence","strengths":["s1","s2"],"improvements":["i1","i2"],"improvedAnswer":"concise improved answer"}

                Role: %s
                Question: %s
                Answer: %s
                """.formatted(safe(role), safe(question), truncate(safe(answer), 3000)));

        if (result != null && result.getMetadata() != null) metadata.putAll(result.getMetadata());
        InterviewFeedbackResponse aiResponse = parseFeedback(result == null ? null : result.getJson(), metadata);
        if (aiResponse != null) {
            aiResponse.getMetadata().put("source", "ai");
            return aiResponse;
        }

        metadata.put("source", "rules");
        metadata.putIfAbsent("enabled", false);
        return fallbackFeedback(answer, metadata);
    }

    private InterviewQuestionResponse parseQuestions(String json, Map<String, Object> metadata) {
        if (json == null || json.isBlank()) return null;
        try {
            JsonNode root = objectMapper.readTree(stripCodeFence(json));
            List<String> questions = readStringArray(root.path("questions"), 5);
            if (questions.isEmpty()) return null;
            List<String> focusAreas = readStringArray(root.path("focusAreas"), 5);
            return InterviewQuestionResponse.builder()
                    .questions(questions)
                    .focusAreas(focusAreas)
                    .metadata(metadata)
                    .build();
        } catch (Exception e) {
            return null;
        }
    }

    private InterviewFeedbackResponse parseFeedback(String json, Map<String, Object> metadata) {
        if (json == null || json.isBlank()) return null;
        try {
            JsonNode root = objectMapper.readTree(stripCodeFence(json));
            String summary = root.path("summary").asText("").trim();
            if (summary.isBlank()) return null;
            return InterviewFeedbackResponse.builder()
                    .score(clamp(root.path("score").asInt(70)))
                    .summary(summary)
                    .strengths(readStringArray(root.path("strengths"), 4))
                    .improvements(readStringArray(root.path("improvements"), 4))
                    .improvedAnswer(root.path("improvedAnswer").asText("").trim())
                    .metadata(metadata)
                    .build();
        } catch (Exception e) {
            return null;
        }
    }

    private InterviewQuestionResponse fallbackQuestions(String role, Map<String, Object> metadata) {
        List<String> questions = List.of(
                "Tell me about yourself and why you are targeting a " + role + " role.",
                "Describe one project where you solved a difficult problem. What was your exact contribution?",
                "Which skills make you strongest for this role, and where do you still need practice?",
                "Tell me about a time you worked with a team under pressure.",
                "Walk me through how you would learn a new tool required for this job."
        );
        return InterviewQuestionResponse.builder()
                .questions(questions)
                .focusAreas(List.of("Role clarity", "Project storytelling", "Measurable impact", "STAR structure"))
                .metadata(metadata)
                .build();
    }

    private InterviewFeedbackResponse fallbackFeedback(String answer, Map<String, Object> metadata) {
        int wordCount = answer == null || answer.isBlank() ? 0 : answer.trim().split("\\s+").length;
        boolean hasMetric = answer != null && answer.matches("(?s).*\\b\\d+[%x]?\\b.*");
        boolean hasStructure = answer != null && answer.toLowerCase(Locale.ROOT).matches("(?s).*(situation|task|action|result|because|therefore|finally).*");

        int score = 45;
        if (wordCount >= 60) score += 20;
        if (wordCount >= 120) score += 10;
        if (hasMetric) score += 15;
        if (hasStructure) score += 10;

        List<String> improvements = new ArrayList<>();
        if (wordCount < 60) improvements.add("Expand the answer with a specific example instead of staying general.");
        if (!hasMetric) improvements.add("Add a measurable result, such as time saved, accuracy improved, users served, or score gained.");
        if (!hasStructure) improvements.add("Use STAR: situation, task, action, result.");
        if (improvements.isEmpty()) improvements.add("Tighten the ending with a clearer lesson learned.");

        return InterviewFeedbackResponse.builder()
                .score(clamp(score))
                .summary("Good starting answer. Make it more specific, measurable, and clearly structured.")
                .strengths(List.of("You addressed the question directly", "The answer can be shaped into a strong story"))
                .improvements(improvements)
                .improvedAnswer("I would answer with a specific situation, explain my responsibility, describe the actions I personally took, and close with a measurable result plus what I learned.")
                .metadata(metadata)
                .build();
    }

    private static List<String> readStringArray(JsonNode node, int max) {
        List<String> values = new ArrayList<>();
        if (!node.isArray()) return values;
        for (JsonNode item : node) {
            String value = item.asText("").trim();
            if (!value.isBlank()) values.add(value);
            if (values.size() == max) break;
        }
        return values;
    }

    private static String normalizeRole(String role, User user) {
        if (role != null && !role.isBlank()) return role.trim();
        if (user.getCurrentPosition() != null && !user.getCurrentPosition().isBlank()) return user.getCurrentPosition().trim();
        return "software developer";
    }

    private static String stripCodeFence(String value) {
        String text = value.trim();
        if (!text.startsWith("```")) return text;
        text = text.replaceFirst("^```(?:json)?\\s*", "");
        return text.replaceFirst("\\s*```$", "").trim();
    }

    private static String safe(String value) {
        return value == null || value.isBlank() ? "Not provided" : value.trim();
    }

    private static String truncate(String value, int max) {
        return value == null || value.length() <= max ? value : value.substring(0, max) + "...";
    }

    private static int clamp(int value) {
        return Math.max(0, Math.min(100, value));
    }
}
