package com.noorain.login_system.job.controller;

import com.noorain.login_system.job.dto.JobBookmarkRequest;
import com.noorain.login_system.job.dto.JobBookmarkResponse;
import com.noorain.login_system.job.service.JobBookmarkService;
import com.noorain.login_system.model.User;
import com.noorain.login_system.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/v1/bookmarks")
@RequiredArgsConstructor
public class JobBookmarkController {

    private final JobBookmarkService jobBookmarkService;
    private final UserRepository userRepository;

    @GetMapping
    public List<JobBookmarkResponse> list(Authentication authentication) {
        return jobBookmarkService.list(requireCurrentUser(authentication));
    }

    @PostMapping
    public JobBookmarkResponse create(
            @Valid @RequestBody JobBookmarkRequest request,
            Authentication authentication) {
        return jobBookmarkService.create(requireCurrentUser(authentication), request);
    }

    @PutMapping("/{id}")
    public JobBookmarkResponse update(
            @PathVariable("id") Long id,
            @Valid @RequestBody JobBookmarkRequest request,
            Authentication authentication) {
        return jobBookmarkService.update(requireCurrentUser(authentication), id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable("id") Long id, Authentication authentication) {
        jobBookmarkService.delete(requireCurrentUser(authentication), id);
    }

    private User requireCurrentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized"));
    }
}
