package com.techquiz.repository;

import com.techquiz.model.Score;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ScoreRepository extends JpaRepository<Score, Long> {

    @Query("SELECT s FROM Score s LEFT JOIN FETCH s.user ORDER BY s.score DESC, s.playedAt ASC")
    List<Score> findTopScores(Pageable pageable);

    List<Score> findByUserIdOrderByScoreDesc(Long userId);

    @Query("SELECT COUNT(s) + 1 FROM Score s WHERE s.score > :score")
    Long getRankByScore(Integer score);
}
