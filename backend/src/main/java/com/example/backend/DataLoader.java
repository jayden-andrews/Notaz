package com.example.backend;

import com.example.backend.entities.Clef;
import com.example.backend.entities.Exercise;
import com.example.backend.entities.Note;
import com.example.backend.repositories.ExerciseRepository;
import com.example.backend.repositories.NoteRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataLoader implements CommandLineRunner {

    private final NoteRepository noteRepository;
    private final ExerciseRepository exerciseRepository;

    public DataLoader(NoteRepository noteRepository, ExerciseRepository exerciseRepository) {
        this.noteRepository = noteRepository;
        this.exerciseRepository = exerciseRepository;
    }

    @Override
    public void run(String... args) {
        if (noteRepository.count() > 0) return;

        // ── Treble Clef Notes (E4 to E6) ──────────────────────────
        Note e4  = new Note("E4",  1);
        Note f4  = new Note("F4",  2);
        Note g4  = new Note("G4",  3);
        Note a4  = new Note("A4",  4);
        Note b4  = new Note("B4",  5);
        Note c5  = new Note("C5",  6);
        Note d5  = new Note("D5",  7);
        Note e5  = new Note("E5",  8);
        Note f5  = new Note("F5",  9);
        Note g5  = new Note("G5",  10);
        Note a5  = new Note("A5",  11);
        Note b5  = new Note("B5",  12);
        Note c6  = new Note("C6",  13);
        Note d6  = new Note("D6",  14);
        Note e6  = new Note("E6",  15);

        noteRepository.saveAll(List.of(
                e4, f4, g4, a4, b4,
                c5, d5, e5, f5, g5, a5, b5,
                c6, d6, e6
        ));

        // ── Bass Clef Notes (A2 to A4) ─────────────────────────────
        Note a2  = new Note("A2",  16);
        Note b2  = new Note("B2",  17);
        Note c3  = new Note("C3",  18);
        Note d3  = new Note("D3",  19);
        Note e3  = new Note("E3",  20);
        Note f3  = new Note("F3",  21);
        Note g3  = new Note("G3",  22);
        Note a3  = new Note("A3",  23);
        Note b3  = new Note("B3",  24);
        Note c4b = new Note("C4",  25);
        Note d4b = new Note("D4",  26);
        Note e4b = new Note("E4b", 27);
        Note f4b = new Note("F4b", 28);
        Note g4b = new Note("G4b", 29);
        Note a4b = new Note("A4b", 30);

        noteRepository.saveAll(List.of(
                a2, b2,
                c3, d3, e3, f3, g3, a3, b3,
                c4b, d4b, e4b, f4b, g4b, a4b
        ));

        // ── Treble Clef Exercises ──────────────────────────────────
        createExercise(Clef.TREBLE, e4,  List.of(e4, f4, g4, a4));
        createExercise(Clef.TREBLE, f4,  List.of(e4, f4, g4, b4));
        createExercise(Clef.TREBLE, g4,  List.of(f4, g4, a4, b4));
        createExercise(Clef.TREBLE, a4,  List.of(g4, a4, b4, c5));
        createExercise(Clef.TREBLE, b4,  List.of(a4, b4, c5, d5));
        createExercise(Clef.TREBLE, c5,  List.of(b4, c5, d5, e5));
        createExercise(Clef.TREBLE, d5,  List.of(c5, d5, e5, f5));
        createExercise(Clef.TREBLE, e5,  List.of(d5, e5, f5, g5));
        createExercise(Clef.TREBLE, f5,  List.of(e5, f5, g5, a5));
        createExercise(Clef.TREBLE, g5,  List.of(f5, g5, a5, b5));
        createExercise(Clef.TREBLE, a5,  List.of(g5, a5, b5, c6));
        createExercise(Clef.TREBLE, b5,  List.of(a5, b5, c6, d6));
        createExercise(Clef.TREBLE, c6,  List.of(b5, c6, d6, e6));
        createExercise(Clef.TREBLE, d6,  List.of(c6, d6, e6, a5));
        createExercise(Clef.TREBLE, e6,  List.of(d6, e6, c6, b5));

        // ── Bass Clef Exercises ────────────────────────────────────
        createExercise(Clef.BASS, a2,  List.of(a2, b2, c3, d3));
        createExercise(Clef.BASS, b2,  List.of(a2, b2, c3, e3));
        createExercise(Clef.BASS, c3,  List.of(b2, c3, d3, e3));
        createExercise(Clef.BASS, d3,  List.of(c3, d3, e3, f3));
        createExercise(Clef.BASS, e3,  List.of(d3, e3, f3, g3));
        createExercise(Clef.BASS, f3,  List.of(e3, f3, g3, a3));
        createExercise(Clef.BASS, g3,  List.of(f3, g3, a3, b3));
        createExercise(Clef.BASS, a3,  List.of(g3, a3, b3, c4b));
        createExercise(Clef.BASS, b3,  List.of(a3, b3, c4b, d4b));
        createExercise(Clef.BASS, c4b, List.of(b3, c4b, d4b, e4b));
        createExercise(Clef.BASS, d4b, List.of(c4b, d4b, e4b, f4b));
        createExercise(Clef.BASS, e4b, List.of(d4b, e4b, f4b, g4b));
        createExercise(Clef.BASS, f4b, List.of(e4b, f4b, g4b, a4b));
        createExercise(Clef.BASS, g4b, List.of(f4b, g4b, a4b, b3));
        createExercise(Clef.BASS, a4b, List.of(g4b, a4b, f4b, e4b));
    }

    private void createExercise(Clef clef, Note target, List<Note> choices) {
        Exercise exercise = new Exercise();
        exercise.setClef(clef);
        exercise.setTargetNote(target);
        exercise.setChoices(choices);
        exerciseRepository.save(exercise);
    }
}