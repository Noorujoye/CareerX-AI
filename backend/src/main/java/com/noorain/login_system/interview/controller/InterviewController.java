package com.noorain.login_system.interview.controller;

import com.noorain.login_system.interview.dto.InterviewFeedbackRequest;
import com.noorain.login_system.interview.dto.InterviewFeedbackResponse;
import com.noorain.login_system.interview.dto.InterviewQuestionRequest;
import com.noorain.login_system.interview.dto.InterviewQuestionResponse;
import com.noorain.login_system.interview.service.InterviewService;
import com.noorain.login_system.model.User;
import com.noorain.login_system.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/interview")
@RequiredArgsConstructor
public class InterviewController {
    private final InterviewService interviewService;
    private final UserRepository userRepository;

    @PostMapping("/questions")
    public InterviewQuestionResponse questions(
            @Valid @RequestBody InterviewQuestionRequest request,
            Authentication authentication) {
        User user = requireCurrentUser(authentication);
        return interviewService.questions(user, request.getRole(), request.getJobDescriptionText());
    }

    @PostMapping("/feedback")
    public InterviewFeedbackResponse feedback(
            @Valid @RequestBody InterviewFeedbackRequest request,
            Authentication authentication) {
        requireCurrentUser(authentication);
        return interviewService.feedback(request.getQuestion(), request.getAnswer(), request.getRole());
    }

    private User requireCurrentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized"));
    }
}
