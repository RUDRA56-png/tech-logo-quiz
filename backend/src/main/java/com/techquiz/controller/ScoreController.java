package com.techquiz.controller;

import com.techquiz.dto.AuthDTOs.*;
import com.techquiz.service.ScoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/scores")
@RequiredArgsConstructor
public class ScoreController {

    private final ScoreService scoreService;

    /** POST /api/scores - Submit a score */
    @PostMapping
    public ResponseEntity<ApiResponse<ScoreResponse>> submitScore(@RequestBody ScoreSubmitRequest req) {
        ScoreResponse res = scoreService.submitScore(req);
        return ResponseEntity.ok(ApiResponse.success(res, "Score submitted successfully"));
    }

    /** GET /api/scores/leaderboard?limit=20 - Public leaderboard */
    @GetMapping("/leaderboard")
    public ResponseEntity<ApiResponse<List<ScoreResponse>>> getLeaderboard(
            @RequestParam(defaultValue = "20") int limit) {
        List<ScoreResponse> scores = scoreService.getLeaderboard(Math.min(limit, 100));
        return ResponseEntity.ok(ApiResponse.success(scores, "Leaderboard fetched"));
    }

    /** GET /api/scores/user/{userId} - Get scores for a specific user */
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<ScoreResponse>>> getUserScores(@PathVariable Long userId) {
        List<ScoreResponse> scores = scoreService.getUserScores(userId);
        return ResponseEntity.ok(ApiResponse.success(scores, "User scores fetched"));
    }
}
