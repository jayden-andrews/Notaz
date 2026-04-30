package com.example.backend.controllers;

import com.example.backend.entities.Clef;
import com.example.backend.entities.Exercise;
import com.example.backend.services.ExerciseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exercises")
@CrossOrigin(origins = "http://localhost:3000")
public class ExerciseController {

    private final ExerciseService exerciseService;

    public ExerciseController(ExerciseService exerciseService) {
        this.exerciseService = exerciseService;
    }

    // GET /api/exercises?clef=TREBLE
    @GetMapping
    public ResponseEntity<List<Exercise>> getExercisesByClef(@RequestParam Clef clef) {
        List<Exercise> exercises = exerciseService.getExercisesByClef(clef);
        return ResponseEntity.ok(exercises);
    }

    // POST /api/exercises/check
    @PostMapping("/check")
    public ResponseEntity<AnswerResponse> checkAnswer(@RequestBody AnswerRequest request) {
        boolean correct = exerciseService.checkAnswer(
                request.getExerciseId(),
                request.getUserAnswer()
        );
        return ResponseEntity.ok(new AnswerResponse(correct));
    }

    // Inner class for request body
    public static class AnswerRequest {
        private Long exerciseId;
        private String userAnswer;

        public Long getExerciseId() { return exerciseId; }
        public void setExerciseId(Long exerciseId) { this.exerciseId = exerciseId; }

        public String getUserAnswer() { return userAnswer; }
        public void setUserAnswer(String userAnswer) { this.userAnswer = userAnswer; }
    }

    // Inner class for response body
    public static class AnswerResponse {
        private boolean correct;

        public AnswerResponse(boolean correct) { this.correct = correct; }

        public boolean isCorrect() { return correct; }
        public void setCorrect(boolean correct) { this.correct = correct; }
    }
}