package com.example.backend.entities;

import jakarta.persistence.*;

@Entity
public class Note {
    @Id
    private Long id;

    private String name;
    private int staffPosition;

    public Note() {}

    public Note(String name, int staffPosition) {
        this.name = name;
        this.staffPosition = staffPosition;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getStaffPosition() {
        return staffPosition;
    }

    public void setStaffPosition(int staffPosition) {
        this.staffPosition = staffPosition;
    }
}
