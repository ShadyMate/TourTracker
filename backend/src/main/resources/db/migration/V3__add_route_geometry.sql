-- V3: Store computed route geometry so saved tours load without re-calling the external API
ALTER TABLE tours ADD COLUMN IF NOT EXISTS route_geometry TEXT;
