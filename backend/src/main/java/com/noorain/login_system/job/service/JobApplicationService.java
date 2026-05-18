package com.noorain.login_system.job.service;

import com.noorain.login_system.job.dto.JobApplicationRequest;
import com.noorain.login_system.job.dto.JobApplicationResponse;
import com.noorain.login_system.job.entity.ApplicationStatus;
import com.noorain.login_system.job.entity.JobApplication;
import com.noorain.login_system.job.repository.JobApplicationRepository;
import com.noorain.login_system.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JobApplicationService {

    private final JobApplicationRepository jobApplicationRepository;

    public List<JobApplicationResponse> list(User user) {
        return jobApplicationRepository.findByUser_IdOrderByUpdatedAtDesc(Long.valueOf(user.getId()))
                .stream()
                .map(JobApplicationService::toResponse)
                .toList();
    }

    public JobApplicationResponse create(User user, JobApplicationRequest request) {
        JobApplication entity = new JobApplication();
        entity.setUser(user);
        applyRequest(entity, request);
        return toResponse(jobApplicationRepository.save(entity));
    }

    public JobApplicationResponse update(User user, Long id, JobApplicationRequest request) {
        JobApplication entity = jobApplicationRepository.findByIdAndUser_Id(id, Long.valueOf(user.getId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));
        applyRequest(entity, request);
        return toResponse(jobApplicationRepository.save(entity));
    }

    public void delete(User user, Long id) {
        JobApplication entity = jobApplicationRepository.findByIdAndUser_Id(id, Long.valueOf(user.getId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));
        jobApplicationRepository.delete(entity);
    }

    private static void applyRequest(JobApplication entity, JobApplicationRequest request) {
        entity.setCompany(trimToNull(request.getCompany()));
        entity.setRoleTitle(trimToNull(request.getRoleTitle()));
        entity.setLocation(trimToNull(request.getLocation()));
        entity.setSourceUrl(trimToNull(request.getSourceUrl()));
        entity.setNotes(trimToNull(request.getNotes()));
        entity.setAppliedDate(request.getAppliedDate());
        entity.setStatus(parseStatus(request.getStatus()));
    }

    private static ApplicationStatus parseStatus(String raw) {
        if (raw == null || raw.isBlank()) {
            return ApplicationStatus.APPLIED;
        }
        try {
            return ApplicationStatus.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return ApplicationStatus.APPLIED;
        }
    }

    private static JobApplicationResponse toResponse(JobApplication entity) {
        return JobApplicationResponse.builder()
                .id(entity.getId())
                .company(entity.getCompany())
                .roleTitle(entity.getRoleTitle())
                .location(entity.getLocation())
                .sourceUrl(entity.getSourceUrl())
                .notes(entity.getNotes())
                .status(entity.getStatus() == null ? null : entity.getStatus().name())
                .appliedDate(entity.getAppliedDate())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private static String trimToNull(String value) {
        if (value == null)
            return null;
        String trimmed = value.trim();
        return trimmed.isBlank() ? null : trimmed;
    }
}
