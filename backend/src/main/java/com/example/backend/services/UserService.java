package com.example.backend.services;

import com.example.backend.entities.User;
import com.example.backend.repositories.UserRepository;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User register(String email, String passwordHash) {
        if (email == null || !email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw new RuntimeException("INVALID_EMAIL");
        }
        if (userRepository.findByEmail(email) != null) {
            throw new RuntimeException("EMAIL_EXISTS");
        }
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordHash);
        user.setCreatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    public void deleteAccount(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("USER_NOT_FOUND");
        }
        userRepository.deleteById(id);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User login(String email, String password) {
    User user = userRepository.findByEmail(email);
    if (user == null || !user.getPasswordHash().equals(password)) {
        return null;
    }
    return user;
    }
}