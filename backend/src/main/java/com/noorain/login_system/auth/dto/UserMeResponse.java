package com.noorain.login_system.auth.dto;

import com.noorain.login_system.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response for "who am I" endpoint.
 *
 * This is intentionally small and safe to return to the UI.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserMeResponse {
    private String email;
    private String firstName;
    private String lastName;
    private Role role;
}
