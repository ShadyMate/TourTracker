package org.example.backend.repository;

import org.example.backend.model.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);

    @Modifying
    @Query("UPDATE RefreshToken r SET r.revoked = true WHERE r.user.id = :userId")
    void revokeAllByUserId(@Param("userId") Long userId);

    // Returns 1 if the token was consumed, 0 if already revoked/expired/missing (race-safe)
    @Modifying
    @Query("UPDATE RefreshToken r SET r.revoked = true WHERE r.token = :token AND r.revoked = false AND r.expiresAt > :now")
    int consumeIfValid(@Param("token") String token, @Param("now") java.time.LocalDateTime now);

    void deleteByExpiresAtBefore(LocalDateTime threshold);
}
