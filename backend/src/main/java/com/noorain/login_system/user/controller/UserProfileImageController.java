package com.noorain.login_system.user.controller;

import com.noorain.login_system.repository.UserRepository;
import com.noorain.login_system.user.dto.UserProfileResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import jakarta.servlet.http.HttpServletRequest;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/users/me")
@RequiredArgsConstructor
public class UserProfileImageController {

    private static final long MAX_BYTES = 3L * 1024 * 1024;
    private static final Set<String> ALLOWED = Set.of("image/jpeg", "image/png", "image/webp");

    private final UserRepository userRepository;

    @PostMapping(value = "/profile-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public UserProfileResponse uploadProfileImage(Authentication authentication,
                                                  @RequestParam("image") MultipartFile image,
                                                  HttpServletRequest request) {
        var user = requireCurrentUser(authentication);

        if (image == null || image.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image is required");
        }
        if (image.getSize() > MAX_BYTES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image must be <= 3MB");
        }

        String contentType = image.getContentType();
        if (contentType == null || !ALLOWED.contains(contentType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only JPG, PNG, or WEBP images are supported");
        }

        String ext = switch (contentType) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> "";
        };

        String safeEmail = user.getEmail() == null ? "user" : user.getEmail().replaceAll("[^a-zA-Z0-9]", "_");
        String filename = safeEmail + "_" + Instant.now().toEpochMilli() + ext;

        Path uploadDir = Path.of("uploads", "profile-images");
        try {
            Files.createDirectories(uploadDir);
            Path target = uploadDir.resolve(StringUtils.cleanPath(filename));
            try (var in = image.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to save image");
        }

        String publicPath = "/uploads/profile-images/" + filename;
        user.setProfileImageUrl(publicPath);
        userRepository.save(user);

        String responseUrl = buildAbsoluteUrl(request, publicPath);

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
            .profileImageUrl(responseUrl)
                .build();
    }

    private static String buildAbsoluteUrl(HttpServletRequest request, String path) {
        if (path == null) return null;
        if (path.startsWith("http://") || path.startsWith("https://")) return path;
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
}
