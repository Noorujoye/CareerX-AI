package com.noorain.login_system.interview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewQuestionResponse {
    private List<String> questions;
    private List<String> focusAreas;
    private Map<String, Object> metadata;
}
