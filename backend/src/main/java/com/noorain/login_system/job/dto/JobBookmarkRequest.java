package com.noorain.login_system.job.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobBookmarkRequest {

    @NotBlank(message = "Company is required")
    @Size(max = 200, message = "Company is too long")
    private String company;

    @NotBlank(message = "Role title is required")
    @Size(max = 200, message = "Role title is too long")
    private String roleTitle;

    @Size(max = 200, message = "Location is too long")
    private String location;

    @Size(max = 500, message = "Source URL is too long")
    private String sourceUrl;

    @Size(max = 2000, message = "Notes is too long")
    private String notes;
}
