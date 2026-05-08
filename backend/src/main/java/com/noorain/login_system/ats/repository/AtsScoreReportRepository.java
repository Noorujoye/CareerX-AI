package com.noorain.login_system.ats.repository;

import com.noorain.login_system.ats.entity.AtsScoreReport;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AtsScoreReportRepository extends JpaRepository<AtsScoreReport, Long> {

    List<AtsScoreReport> findByUser_IdOrderByCreatedAtDesc(Integer userId, Pageable pageable);

    Optional<AtsScoreReport> findByIdAndUser_Id(Long id, Integer userId);
}
