package com.noorain.login_system.guidance.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.noorain.login_system.ats.ai.AiClient;
import com.noorain.login_system.ats.ai.AiResult;
import com.noorain.login_system.guidance.dto.GuidanceMessageResponse;
import com.noorain.login_system.guidance.entity.GuidanceMessage;
import com.noorain.login_system.guidance.repository.GuidanceMessageRepository;
import com.noorain.login_system.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GuidanceService {
    private static final int HISTORY_LIMIT = 30;

    private final GuidanceMessageRepository guidanceMessageRepository;
    private final AiClient aiClient;
    private final ObjectMapper objectMapper;

    @Value("${app.guidance.ai-enabled:false}")
    private boolean aiEnabled;

    public List<GuidanceMessageResponse> history(User user) {
        var messages = guidanceMessageRepository.findByUser_IdOrderByCreatedAtDesc(
                user.getId(),
                PageRequest.of(0, HISTORY_LIMIT));
        Collections.reverse(messages);
        return messages.stream().map(this::toResponse).toList();
    }

    public GuidanceMessageResponse send(User user, String rawMessage) {
        String message = rawMessage == null ? "" : rawMessage.trim();
        GuidanceMessage savedUserMessage = save(user, "user", message);

        AiReply reply = generateReply(user, message);
        GuidanceMessage savedAssistantMessage = save(user, "assistant", reply.content());

        Map<String, Object> metadata = new LinkedHashMap<>(reply.metadata());
        metadata.put("userMessageId", savedUserMessage.getId());

        return GuidanceMessageResponse.builder()
                .id(savedAssistantMessage.getId())
                .role(savedAssistantMessage.getRole())
                .content(savedAssistantMessage.getContent())
                .createdAt(savedAssistantMessage.getCreatedAt())
                .suggestedActions(reply.suggestedActions())
                .metadata(metadata)
                .build();
    }

    private AiReply generateReply(User user, String message) {
        String prompt = buildPrompt(user, message);
        AiResult result = aiEnabled ? aiClient.generateJson(prompt) : null;
        Map<String, Object> metadata = new LinkedHashMap<>();
        if (result != null && result.getMetadata() != null) {
            metadata.putAll(result.getMetadata());
        }

        if (result != null && result.getJson() != null && !result.getJson().isBlank()) {
            AiReply parsed = parseAiReply(result.getJson(), metadata);
            if (parsed != null) {
                metadata.put("source", "ai");
                return parsed;
            }
        }

        metadata.put("source", "rules");
        metadata.putIfAbsent("enabled", false);
        return fallbackReply(user, message, metadata);
    }

    private AiReply parseAiReply(String json, Map<String, Object> metadata) {
        try {
            String cleaned = stripCodeFence(json);
            JsonNode root = objectMapper.readTree(cleaned);
            String reply = root.path("reply").asText("").trim();
            if (reply.isBlank())
                return null;

            List<String> actions = new ArrayList<>();
            JsonNode suggested = root.path("suggestedActions");
            if (suggested.isArray()) {
                for (JsonNode node : suggested) {
                    String action = node.asText("").trim();
                    if (!action.isBlank())
                        actions.add(action);
                    if (actions.size() == 4)
                        break;
                }
            }
            return new AiReply(reply, actions, metadata);
        } catch (Exception e) {
            return null;
        }
    }

    private static String stripCodeFence(String value) {
        String text = value.trim();
        if (!text.startsWith("```"))
            return text;
        text = text.replaceFirst("^```(?:json)?\\s*", "");
        return text.replaceFirst("\\s*```$", "").trim();
    }

    private AiReply fallbackReply(User user, String message, Map<String, Object> metadata) {
        String lower = message.toLowerCase(Locale.ROOT);
        List<String> actions = new ArrayList<>();
        String reply;

        if (lower.contains("resume") || lower.contains("ats")) {
            reply = "Start with the ATS Score page: upload your resume, paste the target job description, then fix the highest-priority gaps first. Focus on truthful keywords, clear section headings, measurable impact, and simple formatting.";
            actions.add("Run an ATS score with the job description");
            actions.add("Add missing must-have keywords only where truthful");
            actions.add("Rewrite weak bullets with numbers and outcomes");
        } else if (lower.contains("interview")) {
            reply = "For interview prep, pick one target role and practice in three passes: core technical questions, project storytelling, and behavioral examples using the STAR format. Save weak answers and retry them after tightening the structure.";
            actions.add("Practice 5 role-specific questions");
            actions.add("Prepare 3 STAR stories");
            actions.add("Review one project end to end");
        } else if (lower.contains("job") || lower.contains("career")) {
            reply = "Narrow the search to roles that match your strongest skills, then compare each posting against your profile. A good next step is to list your top skills, preferred location, and target role so recommendations can become sharper.";
            actions.add("Update skills and experience in your profile");
            actions.add("Choose one target role");
            actions.add("Compare a job description with your resume");
        } else {
            String name = user.getFirstName() == null || user.getFirstName().isBlank() ? "there" : user.getFirstName();
            reply = "Hi " + name
                    + ". Tell me your target role, current skills, and where you feel stuck. I can help with resume improvements, ATS strategy, interview prep, or job search planning.";
            actions.add("Share your target role");
            actions.add("Ask for resume feedback");
            actions.add("Ask for interview practice");
        }

        return new AiReply(reply, actions, metadata);
    }

    private String buildPrompt(User user, String message) {
        return """
                You are CareerX-AI, a concise career guidance assistant.
                Reply with strict JSON only:
                {"reply":"short helpful answer","suggestedActions":["action 1","action 2","action 3"]}

                User profile:
                Name: %s %s
                Current position: %s
                Skills: %s
                Experience: %s
                Education: %s

                User message:
                %s
                """.formatted(
                safe(user.getFirstName()),
                safe(user.getLastName()),
                safe(user.getCurrentPosition()),
                safe(user.getSkills()),
                truncate(safe(user.getExperience()), 800),
                truncate(safe(user.getEducation()), 500),
                message);
    }

    private GuidanceMessage save(User user, String role, String content) {
        return guidanceMessageRepository.save(GuidanceMessage.builder()
                .user(user)
                .role(role)
                .content(content)
                .createdAt(Instant.now())
                .build());
    }

    private GuidanceMessageResponse toResponse(GuidanceMessage message) {
        return GuidanceMessageResponse.builder()
                .id(message.getId())
                .role(message.getRole())
                .content(message.getContent())
                .createdAt(message.getCreatedAt())
                .suggestedActions(List.of())
                .metadata(Map.of())
                .build();
    }

    private static String safe(String value) {
        return value == null || value.isBlank() ? "Not provided" : value.trim();
    }

    private static String truncate(String value, int max) {
        if (value == null || value.length() <= max)
            return value;
        return value.substring(0, max) + "...";
    }

    private record AiReply(String content, List<String> suggestedActions, Map<String, Object> metadata) {
    }
}
