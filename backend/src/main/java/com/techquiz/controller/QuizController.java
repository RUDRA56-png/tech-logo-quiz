package com.techquiz.controller;

import com.techquiz.dto.AuthDTOs.*;
import com.techquiz.model.QuizQuestion;
import com.techquiz.service.QuizService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/questions")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    /** GET /api/questions?count=10 - Fetch randomized quiz questions */
    @GetMapping
    public ResponseEntity<ApiResponse<List<QuestionDTO>>> getQuestions(
            @RequestParam(defaultValue = "10") int count) {
        List<QuestionDTO> questions = quizService.getRandomQuestions(Math.min(count, 20));
        return ResponseEntity.ok(ApiResponse.success(questions, "Questions fetched"));
    }

    /** POST /api/questions/check - Check a single answer */
    @PostMapping("/check")
    public ResponseEntity<ApiResponse<Boolean>> checkAnswer(@RequestBody Map<String, Object> body) {
        Long questionId = Long.valueOf(body.get("questionId").toString());
        String answer = body.get("answer").toString();
        boolean correct = quizService.checkAnswer(questionId, answer);
        return ResponseEntity.ok(ApiResponse.success(correct, correct ? "Correct!" : "Wrong!"));
    }

    /** POST /api/admin/questions - Admin: add a question */
    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<QuizQuestion>> addQuestion(@Valid @RequestBody QuestionRequest req) {
        QuizQuestion q = quizService.addQuestion(req);
        return ResponseEntity.ok(ApiResponse.success(q, "Question added"));
    }

    /** GET /api/admin/questions - Admin: list all questions */
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<QuizQuestion>>> adminGetAll() {
        return ResponseEntity.ok(ApiResponse.success(quizService.getAllQuestions(), "All questions"));
    }
}
