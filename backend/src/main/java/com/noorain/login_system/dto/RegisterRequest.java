package com.noorain.login_system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    // Optional profile fields for future UI (signup screen already collects these)
    private String firstName;
    private String lastName;
    private String email;
    private String password;
}

// this class will take data from frontend