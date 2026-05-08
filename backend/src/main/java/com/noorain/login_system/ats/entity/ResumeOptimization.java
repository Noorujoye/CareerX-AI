package com.noorain.login_system.ats.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.noorain.login_system.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "resume_optimizations", indexes = {
        @Index(name = "idx_resume_opt_user_created", columnList = "user_id,created_at"),
        @Index(name = "idx_resume_opt_created", columnList = "created_at")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeOptimization {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;

    @Column(name = "resume_filename", length = 512)
    private String resumeFilename;

    @Lob
    @Column(name = "resume_text", nullable = false)
    private String resumeText;

    @Lob
    @Column(name = "job_description_text", nullable = false)
    private String jobDescriptionText;

    @Column(name = "overall_score", nullable = false)
    private int overallScore;

    @Column(name = "match_score")
    private Integer matchScore;

    @Lob
    @Column(name = "optimized_resume_text", nullable = false)
    private String optimizedResumeText;

    @Lob
    @Column(name = "response_json", nullable = false)
    private String responseJson;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null)
            createdAt = Instant.now();
    }
}
