package org.example.backend.repository;

import org.example.backend.model.TokenBlacklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface TokenBlacklistRepository extends JpaRepository<TokenBlacklist, String> {
    boolean existsByJti(String jti);
    void deleteByExpiresAtBefore(LocalDateTime threshold);
}
