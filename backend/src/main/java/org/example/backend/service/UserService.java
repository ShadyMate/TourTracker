package org.example.backend.service;

import org.example.backend.dto.AuthResponse;
import org.example.backend.dto.UserDto;

import java.util.Optional;

/**
 * Business Layer - UserService Interface
 */
public interface UserService {
    AuthResponse register(UserDto userDto);
    Optional<AuthResponse> login(String username, String password);
    Optional<UserDto> getUserById(Long id);
    Optional<UserDto> getUserByUsername(String username);
    boolean existsByUsername(String username);
    void deleteUser(Long id);
}
