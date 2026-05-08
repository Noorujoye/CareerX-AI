package com.noorain.login_system.user.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateProfileRequest {

    @Size(max = 100, message = "First name is too long")
    private String firstName;

    @Size(max = 100, message = "Last name is too long")
    private String lastName;

    @Size(max = 2000, message = "Bio is too long")
    private String bio;

    @Size(max = 200, message = "Location is too long")
    private String location;

    @Size(max = 200, message = "Current position is too long")
    private String currentPosition;

    @Size(max = 4000, message = "Experience is too long")
    private String experience;

    @Size(max = 2000, message = "Skills is too long")
    private String skills;

    @Size(max = 2000, message = "Education is too long")
    private String education;

    @Size(max = 300, message = "LinkedIn URL is too long")
    private String linkedinUrl;

    @Size(max = 300, message = "GitHub URL is too long")
    private String githubUrl;

    @Size(max = 500, message = "Profile image URL is too long")
    private String profileImageUrl;
}
