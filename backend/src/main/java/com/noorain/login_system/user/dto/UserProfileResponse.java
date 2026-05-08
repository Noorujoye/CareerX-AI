package com.noorain.login_system.user.dto;

import com.noorain.login_system.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserProfileResponse {
    private String email;
    private String firstName;
    private String lastName;
    private Role role;

    private String bio;
    private String location;
    private String currentPosition;
    private String experience;
    private String skills;
    private String education;
    private String linkedinUrl;
    private String githubUrl;

    private String profileImageUrl;
}
