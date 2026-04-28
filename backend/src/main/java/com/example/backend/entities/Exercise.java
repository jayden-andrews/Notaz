package com.example.backend.entities;

import jakarta.persistence.*;

import java.util.ArrayList;

@Entity
public class Exercise {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private Clef clef;

    @ManyToOne
    private Note targetNote;

    @OneToMany
    private ArrayList<Note> choices;

    public Exercise() {}

    public Exercise(Long id, Clef clef, Note targetNote, ArrayList<Note> choices) {
        this.id = id;
        this.clef = clef;
        this.targetNote = targetNote;
        this.choices = choices;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Clef getClef() {
        return clef;
    }

    public void setClef(Clef clef) {
        this.clef = clef;
    }

    public Note getTargetNote() {
        return targetNote;
    }

    public void setTargetNote(Note targetNote) {
        this.targetNote = targetNote;
    }

    public ArrayList<Note> getChoices() {
        return choices;
    }

    public void setChoices(ArrayList<Note> choices) {
        this.choices = choices;
    }
}