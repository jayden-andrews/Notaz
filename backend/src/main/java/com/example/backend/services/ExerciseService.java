package com.example.backend.services;

import com.example.backend.entities.Clef;
import com.example.backend.entities.Exercise;
import com.example.backend.entities.Note;
import com.example.backend.repositories.ExerciseRepository;
import com.example.backend.repositories.NoteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ExerciseService {

    private final ExerciseRepository exerciseRepository;
    private final NoteRepository noteRepository;

    public ExerciseService(ExerciseRepository exerciseRepository, NoteRepository noteRepository) {
        this.exerciseRepository = exerciseRepository;
        this.noteRepository = noteRepository;
    }

    @Transactional
    public List<Exercise> getExercisesByClef(Clef clef) {
        List<Exercise> exercises = exerciseRepository.findByClef(clef);
        exercises.forEach(e -> e.getChoices().size()); // force initialize
        return exercises;
    }

    public boolean checkAnswer(Long exerciseId, String userAnswer) {
        Exercise exercise = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new RuntimeException("Exercise not found: " + exerciseId));
        return exercise.getTargetNote().getName().equalsIgnoreCase(userAnswer);
    }

    public Note findNoteByStaffPosition(int staffPosition) {
        return noteRepository.findByStaffPosition(staffPosition);
    }
}