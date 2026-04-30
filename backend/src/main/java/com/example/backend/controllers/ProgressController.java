package com.example.backend.controllers;

import com.example.backend.entities.User;
import com.example.backend.services.ProgressService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/progress")
@CrossOrigin(origins = "http://localhost:3000")
public class ProgressController {

    private final ProgressService progressService;

    public ProgressController(ProgressService progressService) {
        this.progressService = progressService;
    }

    // GET /api/progress/{userId}
    @GetMapping("/{userId}")
    public ResponseEntity<User> getProgress(@PathVariable Long userId) {
        User user = progressService.getProgress(userId);
        return ResponseEntity.ok(user);
    }
}