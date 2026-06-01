package com.example.backend.repositories;

import java.util.List;
import com.example.backend.entities.Clef;
import com.example.backend.entities.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;

@Repository
public interface ExerciseRepository extends JpaRepository<Exercise, Long> {
    @Query("SELECT DISTINCT e FROM Exercise e LEFT JOIN FETCH e.choices WHERE e.clef = :clef")
    List<Exercise> findByClef(Clef clef);
}
