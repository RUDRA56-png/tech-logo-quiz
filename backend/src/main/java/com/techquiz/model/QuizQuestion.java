package com.techquiz.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_questions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class QuizQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "logo_url", nullable = false, length = 500)
    private String logoUrl;

    @Column(name = "company_name", nullable = false, length = 100)
    private String companyName;

    @Column(nullable = false, length = 100)
    private String option1;

    @Column(nullable = false, length = 100)
    private String option2;

    @Column(nullable = false, length = 100)
    private String option3;

    @Column(nullable = false, length = 100)
    private String option4;

    @Column(name = "correct_answer", nullable = false, length = 100)
    private String correctAnswer;

    @Column(length = 20)
    @Builder.Default
    private String difficulty = "MEDIUM";

    @Column(length = 50)
    @Builder.Default
    private String category = "TECH";

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
