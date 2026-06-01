package org.example.backend.service.impl;

import org.example.backend.dto.AuthResponse;
import org.example.backend.dto.UserDto;
import org.example.backend.exception.BusinessRuleException;
import org.example.backend.model.User;
import org.example.backend.model.UserPrincipal;
import org.example.backend.repository.UserRepository;
import org.example.backend.security.JwtUtils;
import org.example.backend.service.AuthService;
import org.example.backend.service.RefreshTokenService;
import org.example.backend.service.TokenBlacklistService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
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
    private final TokenBlacklistService tokenBlacklistService;
    private final RefreshTokenService refreshTokenService;

    public AuthServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           JwtUtils jwtUtils,
                           TokenBlacklistService tokenBlacklistService,
                           RefreshTokenService refreshTokenService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.tokenBlacklistService = tokenBlacklistService;
        this.refreshTokenService = refreshTokenService;
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
        Optional<User> optUser = userRepository.findByUsername(username);
        if (optUser.isEmpty()) {
            return Optional.empty();
        }
        User user = optUser.get();

        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(LocalDateTime.now())) {
            throw new BusinessRuleException("Account locked until " + user.getLockedUntil());
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            user.setFailedAttempts(user.getFailedAttempts() + 1);
            if (user.getFailedAttempts() >= 5) {
                user.setLockedUntil(LocalDateTime.now().plusMinutes(15));
                logger.warn("Account locked for user '{}' after {} failed attempts",
                        username, user.getFailedAttempts());
            }
            userRepository.save(user);
            return Optional.empty();
        }

        // Reset lockout state on successful login
        if (user.getFailedAttempts() > 0 || user.getLockedUntil() != null) {
            user.setFailedAttempts(0);
            user.setLockedUntil(null);
            userRepository.save(user);
        }

        return Optional.of(toAuthResponse(user));
    }

    @Override
    public AuthResponse refreshTokens(String refreshToken) {
        org.example.backend.model.RefreshToken rotated = refreshTokenService.rotateRefreshToken(refreshToken);
        return toAuthResponse(rotated.getUser());
    }

    @Override
    public void logout(String token) {
        String jti = jwtUtils.getJtiFromToken(token);
        tokenBlacklistService.blacklist(jti, jwtUtils.getExpirationFromToken(token));
        logger.info("Token revoked: jti={}", jti);
    }

    private AuthResponse toAuthResponse(User user) {
        String token = jwtUtils.generateToken(new UserPrincipal(user.getId(), user.getUsername()));
        return new AuthResponse(token, user.getId(), user.getUsername(), user.getEmail());
    }
}
