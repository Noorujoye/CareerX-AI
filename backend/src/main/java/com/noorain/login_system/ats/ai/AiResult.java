package com.noorain.login_system.ats.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
@AllArgsConstructor
public class AiResult {
    private final String json;
    private final Map<String, Object> metadata;
}
