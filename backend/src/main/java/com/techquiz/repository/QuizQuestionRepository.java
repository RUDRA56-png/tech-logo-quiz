package com.techquiz.repository;

import com.techquiz.model.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;

@Repository
public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, Long> {

    // Get all active questions
    List<QuizQuestion> findByIsActiveTrue();

    // 🔥 FINAL FIXED QUERY (MySQL compatible)
    @Query(value = "SELECT * FROM quiz_questions WHERE is_active = 1 ORDER BY RAND() LIMIT :limit", nativeQuery = true)
    List<QuizQuestion> findRandomActiveQuestions(@Param("limit") int limit);
}