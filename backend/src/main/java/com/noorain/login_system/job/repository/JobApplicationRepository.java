package com.noorain.login_system.job.repository;

import com.noorain.login_system.job.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findByUser_IdOrderByUpdatedAtDesc(Long userId);

    Optional<JobApplication> findByIdAndUser_Id(Long id, Long userId);
}
