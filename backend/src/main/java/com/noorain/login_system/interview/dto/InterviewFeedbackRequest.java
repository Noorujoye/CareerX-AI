package com.noorain.login_system.interview.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class InterviewFeedbackRequest {
    @NotBlank(message = "Question is required")
    @Size(max = 1000, message = "Question is too long")
    private String question;

    @NotBlank(message = "Answer is required")
    @Size(max = 4000, message = "Answer is too long")
    private String answer;

    @Size(max = 120, message = "Role is too long")
    private String role;
}
