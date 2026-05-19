package org.example.backend.service;

import org.example.backend.dto.AuthResponse;
import org.example.backend.dto.UserDto;

import java.util.Optional;

/**
 * Business Layer - AuthService
 * Responsible for credential validation, user registration, and JWT issuance.
 * Keeps authentication logic separate from generic user CRUD (UserService).
 */
public interface AuthService {
    AuthResponse register(UserDto userDto);
    Optional<AuthResponse> login(String username, String password);
}
