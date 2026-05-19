package com.example.backend.controllers;

import com.example.backend.entities.User;
import com.example.backend.services.UserService;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            User user = userService.register(
                request.getEmail(),
                request.getPasswordHash()
            );
            return ResponseEntity.ok(user);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(409).body("An account with that email already exists.");
        } catch (RuntimeException e) {
            if ("EMAIL_EXISTS".equals(e.getMessage())) {
                return ResponseEntity.status(409).body("An account with that email already exists.");
            }
            if ("INVALID_EMAIL".equals(e.getMessage())) {
                return ResponseEntity.status(400).body("Please enter a valid email address.");
            }
            return ResponseEntity.status(500).body("Something went wrong.");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<User> login(@RequestBody LoginRequest request) {
        User user = userService.login(request.getEmail(), request.getPassword());
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(user);
    }

    // GET /api/users/{email}
    @GetMapping("/{email}")
    public ResponseEntity<User> findByEmail(@PathVariable String email) {
        User user = userService.findByEmail(email);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }

    // Inner class for request body
    public static class RegisterRequest {
        private String email;
        private String passwordHash;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPasswordHash() { return passwordHash; }
        public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    }

    public static class LoginRequest {
        private String email;
        private String password;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
}