package com.noorain.login_system.recruiter.controller;

import com.noorain.login_system.recruiter.dto.CandidateMatchResponse;
import com.noorain.login_system.recruiter.service.RecruiterMatchService;
import com.noorain.login_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/v1/recruiter")
@RequiredArgsConstructor
public class RecruiterMatchController {
    private final RecruiterMatchService recruiterMatchService;
    private final UserRepository userRepository;

    @PostMapping(value = "/matches", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public CandidateMatchResponse matches(
            @RequestPart(value = "role", required = false) String role,
            @RequestPart("jobDescriptionText") String jobDescriptionText,
            @RequestPart("resumes") List<MultipartFile> resumes,
            Authentication authentication) {
        requireCurrentUser(authentication);
        return recruiterMatchService.match(role, jobDescriptionText, resumes);
    }

    private void requireCurrentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized"));
    }
}
