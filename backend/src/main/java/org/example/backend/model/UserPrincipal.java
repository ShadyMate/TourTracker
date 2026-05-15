package org.example.backend.model;

/**
 * Lightweight principal stored in Spring Security's context after JWT validation.
 * Avoids a DB round-trip on every request — all required data is read from the token.
 */
public record UserPrincipal(Long id, String username) {}
