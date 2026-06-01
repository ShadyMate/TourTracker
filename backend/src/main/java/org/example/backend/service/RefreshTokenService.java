package org.example.backend.service;

import org.example.backend.exception.BusinessRuleException;
import org.example.backend.model.RefreshToken;
import org.example.backend.model.User;
import org.example.backend.repository.RefreshTokenRepository;
import org.example.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class RefreshTokenService {
    private static final Logger logger = LoggerFactory.getLogger(RefreshTokenService.class);

    @Value("${app.jwt.refresh-expiration-days}")
    private int refreshExpirationDays;

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository,
                               UserRepository userRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public RefreshToken createRefreshToken(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessRuleException("User not found"));
        RefreshToken token = new RefreshToken();
        token.setToken(UUID.randomUUID().toString());
        token.setUser(user);
        token.setExpiresAt(LocalDateTime.now().plusDays(refreshExpirationDays));
        return refreshTokenRepository.save(token);
    }

    @Transactional
    public RefreshToken rotateRefreshToken(String rawToken) {
        // Atomic consume: sets revoked=true only if the token is valid and unexpired.
        // Zero affected rows means the token was already revoked, expired, or never existed —
        // which closes the race window where two concurrent requests both see revoked=false.
        int consumed = refreshTokenRepository.consumeIfValid(rawToken, LocalDateTime.now());
        if (consumed == 0) {
            // Distinguish replay (token exists but revoked) from invalid/expired
            refreshTokenRepository.findByToken(rawToken).ifPresent(t -> {
                if (t.isRevoked()) {
                    // Replay attack — revoke all sessions for this user as a precaution
                    refreshTokenRepository.revokeAllByUserId(t.getUser().getId());
                    logger.warn("Refresh token replay detected for user {}", t.getUser().getId());
                }
            });
            throw new BusinessRuleException("Invalid, expired, or already-used refresh token");
        }

        RefreshToken existing = refreshTokenRepository.findByToken(rawToken)
                .orElseThrow(() -> new BusinessRuleException("Invalid refresh token"));

        RefreshToken newToken = new RefreshToken();
        newToken.setToken(UUID.randomUUID().toString());
        newToken.setUser(existing.getUser());
        newToken.setExpiresAt(LocalDateTime.now().plusDays(refreshExpirationDays));
        return refreshTokenRepository.save(newToken);
    }

    @Transactional
    public void revokeAllForUser(Long userId) {
        refreshTokenRepository.revokeAllByUserId(userId);
        logger.debug("Revoked all refresh tokens for user {}", userId);
    }

    // Runs daily at midnight to purge expired entries
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void purgeExpired() {
        refreshTokenRepository.deleteByExpiresAtBefore(LocalDateTime.now());
        logger.debug("Purged expired refresh tokens");
    }
}
