package com.noorain.login_system.ats.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Minimal Gemini REST client (Google AI Studio key).
 * Uses Gemini generateContent endpoint and returns raw JSON text from the model.
 */
@Component
@RequiredArgsConstructor
public class GeminiAiClient implements AiClient {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.ai.gemini.api-key:}")
    private String apiKey;

    @Value("${app.ai.gemini.model:gemini-1.5-flash}")
    private String model;

    private final RestClient restClient = RestClient.builder().build();

    @Override
    public AiResult generateJson(String prompt) {
        if (apiKey == null || apiKey.isBlank()) {
            return AiResult.builder()
                    .json(null)
                    .metadata(Map.of("provider", "gemini", "enabled", false))
                    .build();
        }

        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;

        Map<String, Object> body = Map.of(
                "contents", new Object[]{
                        Map.of("role", "user", "parts", new Object[]{Map.of("text", prompt)})
                },
                "generationConfig", Map.of(
                        "temperature", 0.2,
                        "maxOutputTokens", 700
                )
        );

        Map<String, Object> meta = new LinkedHashMap<>();
        meta.put("provider", "gemini");
        meta.put("model", model);

        try {
            ResponseEntity<String> response = restClient.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .toEntity(String.class);

            meta.put("httpStatus", response.getStatusCode().value());

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                return AiResult.builder().json(null).metadata(meta).build();
            }

            String extracted = extractTextFromGenerateContent(response.getBody());
            return AiResult.builder().json(extracted).metadata(meta).build();
        } catch (Exception e) {
            meta.put("error", e.getMessage());
            meta.put("enabled", false);
            return AiResult.builder()
                    .json(null)
                    .metadata(meta)
                    .build();
        }
    }

    private String extractTextFromGenerateContent(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode candidates = root.path("candidates");
            if (!candidates.isArray() || candidates.isEmpty()) return null;
            JsonNode parts = candidates.get(0).path("content").path("parts");
            if (!parts.isArray() || parts.isEmpty()) return null;

            StringBuilder sb = new StringBuilder();
            for (JsonNode p : parts) {
                String t = p.path("text").asText(null);
                if (t != null) sb.append(t);
            }
            String text = sb.toString().trim();
            return text.isEmpty() ? null : text;
        } catch (Exception e) {
            return null;
        }
    }
}
