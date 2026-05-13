CREATE TABLE users (
    id          BIGSERIAL    PRIMARY KEY,
    username    VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    email       VARCHAR(255) UNIQUE,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE tours (
    id              BIGSERIAL    PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    start_location  VARCHAR(255) NOT NULL,
    end_location    VARCHAR(255) NOT NULL,
    transport_type  VARCHAR(255) NOT NULL,
    distance        DOUBLE PRECISION,
    estimated_time  BIGINT,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    user_id         BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_tours_user_id ON tours(user_id);

CREATE TABLE tour_logs (
    id              BIGSERIAL PRIMARY KEY,
    tour_id         BIGINT    NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    log_date        TIMESTAMP NOT NULL DEFAULT NOW(),
    notes           TEXT,
    difficulty      INTEGER   CHECK (difficulty BETWEEN 1 AND 5),
    total_distance  DOUBLE PRECISION,
    total_time      BIGINT,
    rating          INTEGER   CHECK (rating BETWEEN 1 AND 5),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tour_logs_tour_id ON tour_logs(tour_id);
