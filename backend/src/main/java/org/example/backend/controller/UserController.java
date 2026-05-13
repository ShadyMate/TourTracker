package org.example.backend.controller;

import org.example.backend.dto.LoginRequest;
import org.example.backend.dto.UserDto;
import org.example.backend.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Presentation Layer - UserController
 * Handles HTTP requests related to users.
 */
@RestController
@RequestMapping("/users")
public class UserController {
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
        logger.info("Initializing UserController");
    }

    @PostMapping("/login")
    public ResponseEntity<UserDto> login(@RequestBody LoginRequest loginRequest) {
        logger.info("POST /users/login - Login attempt for: {}", loginRequest.getUsername());
        return userService.login(loginRequest.getUsername(), loginRequest.getPassword())
                .map(ResponseEntity::ok)
                .orElseGet(() -> {
                    logger.warn("Login failed for: {}", loginRequest.getUsername());
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
                });
    }

    @PostMapping("/register")
    public ResponseEntity<UserDto> register(@RequestBody UserDto userDto) {
        logger.info("POST /users/register - Registering new user: {}", userDto.getUsername());
        try {
            UserDto registered = userService.register(userDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(registered);
        } catch (Exception e) {
            logger.error("Error registering user: {}", userDto.getUsername(), e);
            throw e;
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        logger.info("GET /users/{} - Retrieving user", id);
        try {
            return userService.getUserById(id)
                    .map(ResponseEntity::ok)
                    .orElseGet(() -> {
                        logger.warn("User not found - ID: {}", id);
                        return ResponseEntity.notFound().build();
                    });
        } catch (Exception e) {
            logger.error("Error retrieving user with ID: {}", id, e);
            throw e;
        }
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<UserDto> getUserByUsername(@PathVariable String username) {
        logger.info("GET /users/username/{} - Retrieving user by username", username);
        try {
            return userService.getUserByUsername(username)
                    .map(ResponseEntity::ok)
                    .orElseGet(() -> {
                        logger.warn("User not found - username: {}", username);
                        return ResponseEntity.notFound().build();
                    });
        } catch (Exception e) {
            logger.error("Error retrieving user by username: {}", username, e);
            throw e;
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        logger.info("DELETE /users/{} - Deleting user", id);
        try {
            userService.deleteUser(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Error deleting user with ID: {}", id, e);
            throw e;
        }
    }
}
