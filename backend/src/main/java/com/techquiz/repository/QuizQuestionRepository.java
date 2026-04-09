package com.techquiz.repository;

import com.techquiz.model.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, Long> {

    List<QuizQuestion> findByIsActiveTrue();

    @Query(value = "SELECT * FROM quiz_questions WHERE is_active = true ORDER BY RAND() LIMIT :limit", nativeQuery = true)
    List<QuizQuestion> findRandomActiveQuestions(int limit);
}
