package com.techquiz.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

// ============================================================
// AUTH DTOs
// ============================================================

/**
 * Request body for user registration.
 */
public class AuthDTOs {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class RegisterRequest {
        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 100)
        private String name;

        @Email(message = "Valid email required")
        @NotBlank(message = "Email is required")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class LoginRequest {
        @Email @NotBlank
        private String email;
        @NotBlank
        private String password;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AuthResponse {
        private String token;
        private String name;
        private String email;
        private String role;
        private Long userId;
    }

    // ============================================================
    // QUIZ DTOs
    // ============================================================

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class QuestionDTO {
        private Long id;
        private String logoUrl;
        private List<String> options;
        private String difficulty;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class QuestionRequest {
        @NotBlank private String logoUrl;
        @NotBlank private String companyName;
        @NotBlank private String option1;
        @NotBlank private String option2;
        @NotBlank private String option3;
        @NotBlank private String option4;
        @NotBlank private String correctAnswer;
        private String difficulty = "MEDIUM";
    }

    // ============================================================
    // SCORE DTOs
    // ============================================================

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class ScoreSubmitRequest {
        private Long userId;               // null for guests
        private String guestName;          // required if userId is null
        private Integer score;
        private Integer totalQuestions;
        private Integer correctAnswers;
        private Integer timeTaken;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ScoreResponse {
        private Long id;
        private String playerName;
        private Integer score;
        private Integer correctAnswers;
        private Integer totalQuestions;
        private Integer timeTaken;
        private LocalDateTime playedAt;
        private String playerType;
        private Long rankPosition;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ApiResponse<T> {
        private boolean success;
        private String message;
        private T data;

        public static <T> ApiResponse<T> success(T data, String message) {
            return ApiResponse.<T>builder().success(true).message(message).data(data).build();
        }
        public static <T> ApiResponse<T> error(String message) {
            return ApiResponse.<T>builder().success(false).message(message).build();
        }
    }
}
