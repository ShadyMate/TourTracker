package org.example.backend.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.example.backend.dto.AuthResponse;
import org.example.backend.dto.LoginRequest;
import org.example.backend.dto.UserDto;
import org.example.backend.service.AuthService;
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

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;

    @Value("${app.cookie.secure}")
    private boolean cookieSecure;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request,
                                              HttpServletResponse response) {
        logger.info("POST /auth/login - attempt for: {}", request.getUsername());
        return authService.login(request.getUsername(), request.getPassword())
                .map(auth -> {
                    setAuthCookie(response, auth.getToken());
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
        return ResponseEntity.status(HttpStatus.CREATED).body(auth);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        // Revoke token from cookie first, fall back to Authorization header
        String token = extractToken(request);
        if (StringUtils.hasText(token)) {
            authService.logout(token);
            logger.info("POST /auth/logout - token revoked");
        }
        clearAuthCookie(response);
        return ResponseEntity.noContent().build();
    }

    // ── Cookie helpers ─────────────────────────────────────────────────────────

    private void setAuthCookie(HttpServletResponse response, String token) {
        int maxAge = (int) (jwtExpirationMs / 1000);
        // Servlet API's Cookie class has no SameSite support; use raw header instead
        String cookie = "accessToken=" + token
                + "; Path=/api"
                + "; HttpOnly"
                + "; SameSite=Strict"
                + "; Max-Age=" + maxAge
                + (cookieSecure ? "; Secure" : "");
        response.addHeader("Set-Cookie", cookie);
    }

    private void clearAuthCookie(HttpServletResponse response) {
        String cookie = "accessToken="
                + "; Path=/api"
                + "; HttpOnly"
                + "; SameSite=Strict"
                + "; Max-Age=0"
                + (cookieSecure ? "; Secure" : "");
        response.addHeader("Set-Cookie", cookie);
    }

    private String extractToken(HttpServletRequest request) {
        // Prefer cookie over Authorization header
        if (request.getCookies() != null) {
            for (jakarta.servlet.http.Cookie c : request.getCookies()) {
                if ("accessToken".equals(c.getName())) {
                    return c.getValue();
                }
            }
        }
        String header = request.getHeader("Authorization");
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}
