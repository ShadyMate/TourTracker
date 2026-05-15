package org.example.backend.service.impl;

import org.example.backend.dto.AuthResponse;
import org.example.backend.dto.UserDto;
import org.example.backend.exception.BusinessRuleException;
import org.example.backend.model.User;
import org.example.backend.model.UserPrincipal;
import org.example.backend.repository.UserRepository;
import org.example.backend.security.JwtUtils;
import org.example.backend.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.regex.Pattern;

/**
 * Business Layer Implementation - UserService
 */
@Service
public class UserServiceImpl implements UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);
    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$");

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public UserServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        logger.info("Initializing UserService");
    }

    @Override
    public AuthResponse register(UserDto userDto) {
        logger.debug("Registering new user: {}", userDto.getUsername());

        if (userRepository.existsByUsername(userDto.getUsername())) {
            logger.warn("Registration failed: username already exists - {}", userDto.getUsername());
            throw new BusinessRuleException("Username already exists");
        }

        if (userDto.getEmail() == null || !EMAIL_PATTERN.matcher(userDto.getEmail()).matches()) {
            logger.warn("Registration failed: invalid email - {}", userDto.getEmail());
            throw new BusinessRuleException("Invalid email address");
        }

        User user = new User();
        user.setUsername(userDto.getUsername());
        user.setPassword(passwordEncoder.encode(userDto.getPassword()));
        user.setEmail(userDto.getEmail());

        User saved = userRepository.save(user);
        logger.info("User registered with ID: {}", saved.getId());

        return buildAuthResponse(saved);
    }

    @Override
    public Optional<AuthResponse> login(String username, String password) {
        logger.debug("Login attempt for: {}", username);
        return userRepository.findByUsername(username)
                .filter(user -> passwordEncoder.matches(password, user.getPassword()))
                .map(this::buildAuthResponse);
    }

    @Override
    public Optional<UserDto> getUserById(Long id) {
        return userRepository.findById(id).map(this::mapToDto);
    }

    @Override
    public Optional<UserDto> getUserByUsername(String username) {
        return userRepository.findByUsername(username).map(this::mapToDto);
    }

    @Override
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    @Override
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new BusinessRuleException("User not found");
        }
        userRepository.deleteById(id);
        logger.info("User {} deleted", id);
    }

    private AuthResponse buildAuthResponse(User user) {
        UserPrincipal principal = new UserPrincipal(user.getId(), user.getUsername());
        String token = jwtUtils.generateToken(principal);
        return new AuthResponse(token, user.getId(), user.getUsername(), user.getEmail());
    }

    private UserDto mapToDto(User user) {
        return new UserDto(user.getId(), user.getUsername(), user.getEmail(), null);
    }
}
