package com.techquiz.service;

import com.techquiz.dto.AuthDTOs.*;
import com.techquiz.model.Score;
import com.techquiz.model.User;
import com.techquiz.repository.ScoreRepository;
import com.techquiz.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScoreService {

    private final ScoreRepository scoreRepository;
    private final UserRepository userRepository;

    /** Submit a score after quiz completion. */
    public ScoreResponse submitScore(ScoreSubmitRequest req) {
        Score score = Score.builder()
                .score(req.getScore())
                .totalQuestions(req.getTotalQuestions())
                .correctAnswers(req.getCorrectAnswers())
                .timeTaken(req.getTimeTaken())
                .build();

        if (req.getUserId() != null) {
            User user = userRepository.findById(req.getUserId()).orElse(null);
            score.setUser(user);
        } else {
            score.setGuestName(req.getGuestName() != null ? req.getGuestName() : "Guest");
        }

        score = scoreRepository.save(score);
        Long rank = scoreRepository.getRankByScore(score.getScore());
        return buildResponse(score, rank);
    }

    /** Get top N scores for leaderboard. */
    public List<ScoreResponse> getLeaderboard(int limit) {
        List<Score> scores = scoreRepository.findTopScores(PageRequest.of(0, limit));
        long[] rank = {1};
        return scores.stream()
                .map(s -> buildResponse(s, rank[0]++))
                .collect(Collectors.toList());
    }

    /** Get scores for a specific user. */
    public List<ScoreResponse> getUserScores(Long userId) {
        return scoreRepository.findByUserIdOrderByScoreDesc(userId)
                .stream().map(s -> buildResponse(s, null))
                .collect(Collectors.toList());
    }

    private ScoreResponse buildResponse(Score s, Long rank) {
        String playerName = s.getUser() != null ? s.getUser().getName() : s.getGuestName();
        String playerType = s.getUser() != null ? "registered" : "guest";
        return ScoreResponse.builder()
                .id(s.getId())
                .playerName(playerName)
                .score(s.getScore())
                .correctAnswers(s.getCorrectAnswers())
                .totalQuestions(s.getTotalQuestions())
                .timeTaken(s.getTimeTaken())
                .playedAt(s.getPlayedAt())
                .playerType(playerType)
                .rankPosition(rank)
                .build();
    }
}
