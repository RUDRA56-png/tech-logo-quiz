package com.techquiz.service;

import com.techquiz.dto.AuthDTOs.*;
import com.techquiz.model.QuizQuestion;
import com.techquiz.repository.QuizQuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizQuestionRepository questionRepository;

    /** Fetch N random active questions (options shuffled, correct answer hidden). */
    public List<QuestionDTO> getRandomQuestions(int count) {

        List<QuizQuestion> questions = questionRepository.findRandomActiveQuestions(count);

        // 🔥 FALLBACK (IMPORTANT)
        if (questions == null || questions.isEmpty()) {
            List<QuestionDTO> fallback = new ArrayList<>();

            fallback.add(QuestionDTO.builder()
                    .id(1L)
                    .logoUrl("https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg")
                    .options(List.of("React", "Angular", "Vue", "Svelte"))
                    .difficulty("EASY")
                    .build());

            fallback.add(QuestionDTO.builder()
                    .id(2L)
                    .logoUrl("https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg")
                    .options(List.of("Ruby", "Python", "Perl", "Swift"))
                    .difficulty("EASY")
                    .build());

            return fallback;
        }

        List<QuestionDTO> dtos = new ArrayList<>();

        for (QuizQuestion q : questions) {

            List<String> options = new ArrayList<>(
                    List.of(q.getOptionA(), q.getOptionB(), q.getOptionC(), q.getOptionD())
            );

            Collections.shuffle(options);

            dtos.add(QuestionDTO.builder()
                    .id(q.getId())
                    .logoUrl(q.getLogoUrl())
                    .options(options)
                    .difficulty(q.getDifficulty())
                    .build());
        }

        return dtos;
    }

    /** Verify an answer for a question id. Returns true if correct. */
    public boolean checkAnswer(Long questionId, String answer) {
        QuizQuestion q = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        return q.getCorrectAnswer().equalsIgnoreCase(answer.trim());
    }

    /** Admin: add new question. */
    public QuizQuestion addQuestion(QuestionRequest req) {

        QuizQuestion q = QuizQuestion.builder()
                .logoUrl(req.getLogoUrl())
                .companyName(req.getCompanyName())
                .optionA(req.getOption1())
                .optionB(req.getOption2())
                .optionC(req.getOption3())
                .optionD(req.getOption4())
                .correctAnswer(req.getCorrectAnswer())
                .difficulty(req.getDifficulty())
                .build();

        return questionRepository.save(q);
    }

    /** Admin: get all questions with correct answers. */
    public List<QuizQuestion> getAllQuestions() {
        return questionRepository.findAll();
    }
}