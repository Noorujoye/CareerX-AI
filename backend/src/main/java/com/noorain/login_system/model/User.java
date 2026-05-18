package com.noorain.login_system.model;

import com.noorain.login_system.entity.Role;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, nullable = false)
    private String email;

    @JsonIgnore
    private String password;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name") 
    private String lastName;

    @Column(length = 2000)
    private String bio;

    private String location;

    private String currentPosition;

    @Column(length = 4000)
    private String experience;

    @Column(length = 2000)
    private String skills;

    @Column(length = 2000)
    private String education;

    private String linkedinUrl;

    @Column(name = "github_url", length = 2000)
    private String githubUrl;

    @Column(name = "profile_image_url", length = 2000)
    private String profileImageUrl;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(name = "reset_password_token")
    private String resetPasswordToken;

    @Column(name = "reset_password_token_expiry")
    private java.time.Instant resetPasswordTokenExpiry;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Spring Security expects authorities like "ROLE_USER" for hasRole("USER")
        // checks.
        // This makes authorization work correctly once you start protecting endpoints
        // by role.
        if (role == null)
            return List.of();
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
