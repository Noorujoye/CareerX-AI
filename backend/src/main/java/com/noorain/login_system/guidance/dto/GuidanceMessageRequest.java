package com.noorain.login_system.guidance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class GuidanceMessageRequest {
    @NotBlank(message = "Message is required")
    @Size(max = 2000, message = "Message is too long")
    private String message;
}
