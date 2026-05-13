-- V2: Add fields needed by the Angular frontend

-- Tours: image selection and geocoded coordinates
ALTER TABLE tours ADD COLUMN IF NOT EXISTS selected_image VARCHAR(255);
ALTER TABLE tours ADD COLUMN IF NOT EXISTS from_lat  DOUBLE PRECISION;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS from_lng  DOUBLE PRECISION;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS to_lat    DOUBLE PRECISION;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS to_lng    DOUBLE PRECISION;

-- Tour logs: time strings and wider difficulty/rating ranges
ALTER TABLE tour_logs ADD COLUMN IF NOT EXISTS start_time      VARCHAR(10);
ALTER TABLE tour_logs ADD COLUMN IF NOT EXISTS end_time        VARCHAR(10);
ALTER TABLE tour_logs ADD COLUMN IF NOT EXISTS total_time_str  VARCHAR(20);

-- Broaden difficulty from 1-5 to 1-10
ALTER TABLE tour_logs DROP CONSTRAINT IF EXISTS tour_logs_difficulty_check;
ALTER TABLE tour_logs ADD  CONSTRAINT tour_logs_difficulty_check CHECK (difficulty BETWEEN 1 AND 10);

-- Change rating to DOUBLE PRECISION to support half-star values (e.g. 3.5)
ALTER TABLE tour_logs DROP CONSTRAINT IF EXISTS tour_logs_rating_check;
ALTER TABLE tour_logs ALTER COLUMN rating TYPE DOUBLE PRECISION USING COALESCE(rating, 0)::DOUBLE PRECISION;
