-- V4: Store the filesystem path of the uploaded tour map image
ALTER TABLE tours ADD COLUMN IF NOT EXISTS map_image_path VARCHAR(512);
