package com.example.backend.repositories;

import java.util.List;
import com.example.backend.entities.Clef;
import com.example.backend.entities.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface ExerciseRepository extends JpaRepository<Exercise, Long> {
    List<Exercise> findByClef(Clef clef);
}
