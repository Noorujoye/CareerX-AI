package com.noorain.login_system.guidance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuidanceMessageResponse {
    private Long id;
    private String role;
    private String content;
    private Instant createdAt;
    private List<String> suggestedActions;
    private Map<String, Object> metadata;
}
