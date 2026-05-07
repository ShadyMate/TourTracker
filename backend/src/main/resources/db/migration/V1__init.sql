CREATE TABLE users (
                       id          BIGSERIAL PRIMARY KEY,
                       username    VARCHAR(255) NOT NULL UNIQUE,
                       password    VARCHAR(255) NOT NULL,
                       email       VARCHAR(255) UNIQUE,
                       created_at  TIMESTAMP
);

CREATE TABLE tours (
                       id              BIGSERIAL PRIMARY KEY,
                       name            VARCHAR(255) NOT NULL,
                       description     TEXT,
                       start_location  VARCHAR(255) NOT NULL,
                       end_location    VARCHAR(255) NOT NULL,
                       transport_type  VARCHAR(255) NOT NULL,
                       distance        DOUBLE PRECISION,
                       estimated_time  BIGINT,
                       created_at      TIMESTAMP,
                       user_id         BIGINT NOT NULL REFERENCES users(id)
);

CREATE TABLE tour_logs (
                           id              BIGSERIAL PRIMARY KEY,
                           tour_id         BIGINT NOT NULL REFERENCES tours(id),
                           log_date        TIMESTAMP,
                           notes           TEXT,
                           difficulty      INTEGER,
                           total_distance  DOUBLE PRECISION,
                           total_time      BIGINT,
                           rating          INTEGER,
                           created_at      TIMESTAMP
);