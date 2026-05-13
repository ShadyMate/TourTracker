package org.example.backend.service.impl;

import org.example.backend.dto.UserDto;
import org.example.backend.exception.BusinessRuleException;
import org.example.backend.model.User;
import org.example.backend.repository.UserRepository;
import org.example.backend.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.util.Optional;

/**
 * Business Layer Implementation - UserService
 * Contains business logic for managing users.
 */
@Service
public class UserServiceImpl implements UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);
    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
        logger.info("Initializing UserService");
    }

    @Override
    public UserDto register(UserDto userDto) {
        logger.debug("Registering new user: {}", userDto.getUsername());
        
        if (userRepository.existsByUsername(userDto.getUsername())) {
            logger.warn("Registration failed: Username already exists - {}", userDto.getUsername());
            throw new BusinessRuleException("Username already exists");
        }

        User user = new User();
        user.setUsername(userDto.getUsername());
        user.setPassword(userDto.getPassword()); // TODO: Hash password in production
        user.setEmail(userDto.getEmail());

        User savedUser = userRepository.save(user);
        logger.info("User registered successfully with ID: {}", savedUser.getId());

        return mapToDto(savedUser);
    }

    @Override
    public Optional<UserDto> login(String username, String password) {
        logger.debug("Login attempt for username: {}", username);
        return userRepository.findByUsername(username)
                .filter(user -> user.getPassword().equals(password))
                .map(this::mapToDto);
    }

    @Override
    public Optional<UserDto> getUserById(Long id) {
        logger.debug("Fetching user with ID: {}", id);
        return userRepository.findById(id).map(this::mapToDto);
    }

    @Override
    public Optional<UserDto> getUserByUsername(String username) {
        logger.debug("Fetching user by username: {}", username);
        return userRepository.findByUsername(username).map(this::mapToDto);
    }

    @Override
    public boolean existsByUsername(String username) {
        logger.debug("Checking if username exists: {}", username);
        return userRepository.existsByUsername(username);
    }

    @Override
    public void deleteUser(Long id) {
        logger.debug("Deleting user with ID: {}", id);
        if (!userRepository.existsById(id)) {
            logger.warn("User not found for deletion - ID: {}", id);
            throw new BusinessRuleException("User not found");
        }
        userRepository.deleteById(id);
        logger.info("User with ID: {} deleted successfully", id);
    }

    private UserDto mapToDto(User user) {
        return new UserDto(user.getId(), user.getUsername(), user.getEmail(), null);
    }
}
