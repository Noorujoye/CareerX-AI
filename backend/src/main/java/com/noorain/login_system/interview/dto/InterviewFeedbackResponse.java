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
public class InterviewFeedbackResponse {
    private int score;
    private String summary;
    private List<String> strengths;
    private List<String> improvements;
    private String improvedAnswer;
    private Map<String, Object> metadata;
}
