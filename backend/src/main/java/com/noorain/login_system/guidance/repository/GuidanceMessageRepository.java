package com.noorain.login_system.guidance.repository;

import com.noorain.login_system.guidance.entity.GuidanceMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GuidanceMessageRepository extends JpaRepository<GuidanceMessage, Long> {
    List<GuidanceMessage> findByUser_IdOrderByCreatedAtDesc(Integer userId, Pageable pageable);
}
