package com.noorain.login_system.user.controller;

import com.noorain.login_system.auth.dto.UserMeResponse;
import com.noorain.login_system.repository.UserRepository;
import com.noorain.login_system.user.dto.UpdateProfileRequest;
import com.noorain.login_system.user.dto.UserProfileResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/me")
    public UserMeResponse me(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        String email = authentication.getName();
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized"));

        return UserMeResponse.builder()
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .build();
    }

    @GetMapping("/me/profile")
    public UserProfileResponse myProfile(Authentication authentication, HttpServletRequest request) {
        var user = requireCurrentUser(authentication);

        String profileImageUrl = user.getProfileImageUrl();
        if (profileImageUrl != null && profileImageUrl.startsWith("/")) {
            profileImageUrl = buildAbsoluteUrl(request, profileImageUrl);
        }

        return UserProfileResponse.builder()
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .bio(user.getBio())
                .location(user.getLocation())
                .currentPosition(user.getCurrentPosition())
                .experience(user.getExperience())
                .skills(user.getSkills())
                .education(user.getEducation())
                .linkedinUrl(user.getLinkedinUrl())
                .githubUrl(user.getGithubUrl())
                .profileImageUrl(profileImageUrl)
                .build();
    }

    @PutMapping("/me/profile")
        public UserProfileResponse updateMyProfile(Authentication authentication,
            @Validated @RequestBody UpdateProfileRequest request,
            HttpServletRequest httpRequest) {
        var user = requireCurrentUser(authentication);

        user.setFirstName(trimToNull(request.getFirstName()));
        user.setLastName(trimToNull(request.getLastName()));
        user.setBio(trimToNull(request.getBio()));
        user.setLocation(trimToNull(request.getLocation()));
        user.setCurrentPosition(trimToNull(request.getCurrentPosition()));
        user.setExperience(trimToNull(request.getExperience()));
        user.setSkills(trimToNull(request.getSkills()));
        user.setEducation(trimToNull(request.getEducation()));
        user.setLinkedinUrl(trimToNull(request.getLinkedinUrl()));
        user.setGithubUrl(trimToNull(request.getGithubUrl()));
        user.setProfileImageUrl(trimToNull(request.getProfileImageUrl()));

        userRepository.save(user);

        return myProfile(authentication, httpRequest);
    }

    private static String buildAbsoluteUrl(HttpServletRequest request, String path) {
        if (path == null) return null;
        if (path.startsWith("http://") || path.startsWith("https://")) return path;
        if (request == null) return path;

        String scheme = request.getScheme();
        String host = request.getServerName();
        int port = request.getServerPort();
        boolean defaultPort = (scheme.equals("http") && port == 80) || (scheme.equals("https") && port == 443);
        String base = defaultPort ? (scheme + "://" + host) : (scheme + "://" + host + ":" + port);
        return base + (path.startsWith("/") ? path : ("/" + path));
    }

    private com.noorain.login_system.model.User requireCurrentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized"));
    }

    private static String trimToNull(String value) {
        if (value == null)
            return null;
        var trimmed = value.trim();
        return trimmed.isBlank() ? null : trimmed;
    }
}
