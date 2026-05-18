package com.noorain.login_system.recruiter.dto;

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
public class CandidateMatchResponse {
    private String role;
    private List<CandidateMatchItem> candidates;
    private Map<String, Object> metadata;
}
