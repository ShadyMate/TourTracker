package org.example.backend.service.impl;

import org.example.backend.dto.AuthResponse;
import org.example.backend.dto.UserDto;
import org.example.backend.exception.BusinessRuleException;
import org.example.backend.model.User;
import org.example.backend.model.UserPrincipal;
import org.example.backend.repository.UserRepository;
import org.example.backend.security.JwtUtils;
import org.example.backend.service.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.regex.Pattern;

/**
 * Business Layer Implementation - AuthService
 * Owns all credential validation, password hashing, and JWT token generation.
 */
@Service
public class AuthServiceImpl implements AuthService {
    private static final Logger logger = LoggerFactory.getLogger(AuthServiceImpl.class);
    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$");

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    @Override
    public AuthResponse register(UserDto userDto) {
        if (userRepository.existsByUsername(userDto.getUsername())) {
            throw new BusinessRuleException("Username already exists");
        }
        if (userDto.getEmail() == null || !EMAIL_PATTERN.matcher(userDto.getEmail()).matches()) {
            throw new BusinessRuleException("Invalid email address");
        }

        User user = new User();
        user.setUsername(userDto.getUsername());
        user.setPassword(passwordEncoder.encode(userDto.getPassword()));
        user.setEmail(userDto.getEmail());

        User saved = userRepository.save(user);
        logger.info("User registered with ID: {}", saved.getId());
        return toAuthResponse(saved);
    }

    @Override
    public Optional<AuthResponse> login(String username, String password) {
        return userRepository.findByUsername(username)
                .filter(user -> passwordEncoder.matches(password, user.getPassword()))
                .map(this::toAuthResponse);
    }

    private AuthResponse toAuthResponse(User user) {
        String token = jwtUtils.generateToken(new UserPrincipal(user.getId(), user.getUsername()));
        return new AuthResponse(token, user.getId(), user.getUsername(), user.getEmail());
    }
}
