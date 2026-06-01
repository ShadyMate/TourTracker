package org.example.backend.service;

import org.example.backend.model.TokenBlacklist;
import org.example.backend.repository.TokenBlacklistRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

@Service
public class TokenBlacklistService {
    private static final Logger logger = LoggerFactory.getLogger(TokenBlacklistService.class);

    private final TokenBlacklistRepository tokenBlacklistRepository;

    public TokenBlacklistService(TokenBlacklistRepository tokenBlacklistRepository) {
        this.tokenBlacklistRepository = tokenBlacklistRepository;
    }

    @Transactional
    public void blacklist(String jti, Date expiry) {
        LocalDateTime expiresAt = expiry.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
        tokenBlacklistRepository.save(new TokenBlacklist(jti, expiresAt, LocalDateTime.now()));
        logger.debug("Token blacklisted: jti={}", jti);
    }

    public boolean isBlacklisted(String jti) {
        return tokenBlacklistRepository.existsByJti(jti);
    }

    // Runs at the top of every hour to purge expired entries
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void purgeExpired() {
        tokenBlacklistRepository.deleteByExpiresAtBefore(LocalDateTime.now());
        logger.debug("Purged expired blacklisted tokens");
    }
}
