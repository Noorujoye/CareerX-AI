package com.noorain.login_system.job.service;

import com.noorain.login_system.job.dto.JobBookmarkRequest;
import com.noorain.login_system.job.dto.JobBookmarkResponse;
import com.noorain.login_system.job.entity.JobBookmark;
import com.noorain.login_system.job.repository.JobBookmarkRepository;
import com.noorain.login_system.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JobBookmarkService {

    private final JobBookmarkRepository jobBookmarkRepository;

    public List<JobBookmarkResponse> list(User user) {
        return jobBookmarkRepository.findByUser_IdOrderByUpdatedAtDesc(Long.valueOf(user.getId()))
                .stream()
                .map(JobBookmarkService::toResponse)
                .toList();
    }

    public JobBookmarkResponse create(User user, JobBookmarkRequest request) {
        JobBookmark entity = new JobBookmark();
        entity.setUser(user);
        applyRequest(entity, request);
        return toResponse(jobBookmarkRepository.save(entity));
    }

    public JobBookmarkResponse update(User user, Long id, JobBookmarkRequest request) {
        JobBookmark entity = jobBookmarkRepository.findByIdAndUser_Id(id, Long.valueOf(user.getId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bookmark not found"));
        applyRequest(entity, request);
        return toResponse(jobBookmarkRepository.save(entity));
    }

    public void delete(User user, Long id) {
        JobBookmark entity = jobBookmarkRepository.findByIdAndUser_Id(id, Long.valueOf(user.getId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bookmark not found"));
        jobBookmarkRepository.delete(entity);
    }

    private static void applyRequest(JobBookmark entity, JobBookmarkRequest request) {
        entity.setCompany(trimToNull(request.getCompany()));
        entity.setRoleTitle(trimToNull(request.getRoleTitle()));
        entity.setLocation(trimToNull(request.getLocation()));
        entity.setSourceUrl(trimToNull(request.getSourceUrl()));
        entity.setNotes(trimToNull(request.getNotes()));
    }

    private static JobBookmarkResponse toResponse(JobBookmark entity) {
        return JobBookmarkResponse.builder()
                .id(entity.getId())
                .company(entity.getCompany())
                .roleTitle(entity.getRoleTitle())
                .location(entity.getLocation())
                .sourceUrl(entity.getSourceUrl())
                .notes(entity.getNotes())
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
