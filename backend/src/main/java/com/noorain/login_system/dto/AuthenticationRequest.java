package com.noorain.login_system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Login request payload.
 *
 * Keep this separate from {@link RegisterRequest} so we don't accidentally
 * allow "register-only" fields (like name/role) during login.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticationRequest {
    private String email;
    private String password;
}