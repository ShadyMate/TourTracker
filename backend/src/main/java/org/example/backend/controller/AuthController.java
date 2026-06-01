package org.example.backend.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.example.backend.dto.AuthResponse;
import org.example.backend.dto.LoginRequest;
import org.example.backend.dto.UserDto;
import org.example.backend.exception.BusinessRuleException;
import org.example.backend.service.AuthService;
import org.example.backend.service.RefreshTokenService;
import org.example.backend.security.JwtUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;
    private final JwtUtils jwtUtils;

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;

    @Value("${app.jwt.refresh-expiration-days}")
    private int refreshExpirationDays;

    @Value("${app.cookie.secure}")
    private boolean cookieSecure;

    public AuthController(AuthService authService,
                          RefreshTokenService refreshTokenService,
                          JwtUtils jwtUtils) {
        this.authService = authService;
        this.refreshTokenService = refreshTokenService;
        this.jwtUtils = jwtUtils;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request,
                                              HttpServletResponse response) {
        logger.info("POST /auth/login - attempt for: {}", request.getUsername());
        return authService.login(request.getUsername(), request.getPassword())
                .map(auth -> {
                    setAuthCookie(response, auth.getToken());
                    setRefreshCookie(response, refreshTokenService.createRefreshToken(auth.getId()).getToken());
                    return ResponseEntity.ok(auth);
                })
                .orElseGet(() -> {
                    logger.warn("Login failed for: {}", request.getUsername());
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
                });
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody UserDto userDto,
                                                 HttpServletResponse response) {
        logger.info("POST /auth/register - registering: {}", userDto.getUsername());
        AuthResponse auth = authService.register(userDto);
        setAuthCookie(response, auth.getToken());
        setRefreshCookie(response, refreshTokenService.createRefreshToken(auth.getId()).getToken());
        return ResponseEntity.status(HttpStatus.CREATED).body(auth);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(HttpServletRequest request,
                                                HttpServletResponse response) {
        String rawToken = extractCookie(request, "refreshToken");
        if (!StringUtils.hasText(rawToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            AuthResponse auth = authService.refreshTokens(rawToken);
            setAuthCookie(response, auth.getToken());
            setRefreshCookie(response, refreshTokenService.createRefreshToken(auth.getId()).getToken());
            logger.info("POST /auth/refresh - session renewed for user {}", auth.getUsername());
            return ResponseEntity.ok(auth);
        } catch (BusinessRuleException e) {
            logger.warn("POST /auth/refresh - rejected: {}", e.getMessage());
            clearAuthCookie(response);
            clearRefreshCookie(response);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        String token = extractCookie(request, "accessToken");
        if (!StringUtils.hasText(token)) {
            // Fall back to Authorization header
            String header = request.getHeader("Authorization");
            if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
                token = header.substring(7);
            }
        }
        if (StringUtils.hasText(token)) {
            try {
                long userId = jwtUtils.getPrincipalFromToken(token).id();
                refreshTokenService.revokeAllForUser(userId);
            } catch (Exception ignored) {}
            authService.logout(token);
            logger.info("POST /auth/logout - session terminated");
        }
        clearAuthCookie(response);
        clearRefreshCookie(response);
        return ResponseEntity.noContent().build();
    }

    // ── Cookie helpers ─────────────────────────────────────────────────────────

    private void setAuthCookie(HttpServletResponse response, String token) {
        int maxAge = (int) (jwtExpirationMs / 1000);
        response.addHeader("Set-Cookie", buildCookie("accessToken", token, "/api", maxAge));
    }

    private void setRefreshCookie(HttpServletResponse response, String token) {
        int maxAge = refreshExpirationDays * 24 * 60 * 60;
        // Scoped to /api/auth/refresh so it is never sent on other requests
        response.addHeader("Set-Cookie", buildCookie("refreshToken", token, "/api/auth/refresh", maxAge));
    }

    private void clearAuthCookie(HttpServletResponse response) {
        response.addHeader("Set-Cookie", buildCookie("accessToken", "", "/api", 0));
    }

    private void clearRefreshCookie(HttpServletResponse response) {
        response.addHeader("Set-Cookie", buildCookie("refreshToken", "", "/api/auth/refresh", 0));
    }

    private String buildCookie(String name, String value, String path, int maxAge) {
        return name + "=" + value
                + "; Path=" + path
                + "; HttpOnly"
                + "; SameSite=Strict"
                + "; Max-Age=" + maxAge
                + (cookieSecure ? "; Secure" : "");
    }

    private String extractCookie(HttpServletRequest request, String name) {
        if (request.getCookies() != null) {
            for (jakarta.servlet.http.Cookie c : request.getCookies()) {
                if (name.equals(c.getName())) {
                    return c.getValue();
                }
            }
        }
        return null;
    }
}
