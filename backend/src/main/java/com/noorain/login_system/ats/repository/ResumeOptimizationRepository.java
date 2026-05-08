package com.noorain.login_system.ats.repository;

import com.noorain.login_system.ats.entity.ResumeOptimization;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ResumeOptimizationRepository extends JpaRepository<ResumeOptimization, Long> {

    List<ResumeOptimization> findByUser_IdOrderByCreatedAtDesc(Integer userId, Pageable pageable);

    Optional<ResumeOptimization> findByIdAndUser_Id(Long id, Integer userId);
}
