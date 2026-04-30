package com.example.backend.services;

import com.example.backend.entities.User;
import com.example.backend.repositories.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class ProgressService {

    private final UserRepository userRepository;

    public ProgressService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getProgress(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
    }
}