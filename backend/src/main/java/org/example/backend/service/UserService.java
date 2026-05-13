package org.example.backend.service;

import org.example.backend.dto.UserDto;
import java.util.Optional;

/**
 * Business Layer - UserService Interface
 * Defines operations for managing users.
 */
public interface UserService {
    UserDto register(UserDto userDto);
    Optional<UserDto> getUserById(Long id);
    Optional<UserDto> getUserByUsername(String username);
    boolean existsByUsername(String username);
    void deleteUser(Long id);
}
