package com.noorain.login_system.interview.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class InterviewQuestionRequest {
    @Size(max = 120, message = "Role is too long")
    private String role;

    @Size(max = 2000, message = "Job description is too long")
    private String jobDescriptionText;
}
