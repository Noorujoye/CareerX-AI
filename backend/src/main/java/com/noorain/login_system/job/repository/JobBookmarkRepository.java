package com.noorain.login_system.job.repository;

import com.noorain.login_system.job.entity.JobBookmark;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JobBookmarkRepository extends JpaRepository<JobBookmark, Long> {
    List<JobBookmark> findByUser_IdOrderByUpdatedAtDesc(Long userId);

    Optional<JobBookmark> findByIdAndUser_Id(Long id, Long userId);
}
