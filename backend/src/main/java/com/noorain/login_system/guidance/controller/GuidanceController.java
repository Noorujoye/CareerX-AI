package com.noorain.login_system.guidance.controller;

import com.noorain.login_system.guidance.dto.GuidanceMessageRequest;
import com.noorain.login_system.guidance.dto.GuidanceMessageResponse;
import com.noorain.login_system.guidance.service.GuidanceService;
import com.noorain.login_system.model.User;
import com.noorain.login_system.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/v1/guidance")
@RequiredArgsConstructor
public class GuidanceController {
    private final GuidanceService guidanceService;
    private final UserRepository userRepository;

    @GetMapping("/messages")
    public List<GuidanceMessageResponse> history(Authentication authentication) {
        return guidanceService.history(requireCurrentUser(authentication));
    }

    @PostMapping("/messages")
    public GuidanceMessageResponse send(
            @Valid @RequestBody GuidanceMessageRequest request,
            Authentication authentication) {
        return guidanceService.send(requireCurrentUser(authentication), request.getMessage());
    }

    private User requireCurrentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized"));
    }
}
