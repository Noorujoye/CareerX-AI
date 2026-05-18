package com.noorain.login_system.job.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobBookmarkResponse {
    private Long id;
    private String company;
    private String roleTitle;
    private String location;
    private String sourceUrl;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;
}
