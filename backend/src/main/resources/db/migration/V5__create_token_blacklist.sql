CREATE TABLE token_blacklist (
    jti        VARCHAR(36)  PRIMARY KEY,
    expires_at TIMESTAMP    NOT NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_token_blacklist_expires_at ON token_blacklist(expires_at);
