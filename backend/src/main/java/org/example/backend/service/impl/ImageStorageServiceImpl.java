package org.example.backend.service.impl;

import org.example.backend.config.StorageProperties;
import org.example.backend.service.ImageStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

/**
 * Filesystem-backed implementation of ImageStorageService.
 * Files are stored as {uuid}.{ext} in the configured image directory.
 * Path traversal is prevented by using only the generated UUID filename.
 */
@Service
public class ImageStorageServiceImpl implements ImageStorageService {
    private static final Logger logger = LoggerFactory.getLogger(ImageStorageServiceImpl.class);
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "gif", "webp");

    private final Path storageDir;
    private final long maxFileSizeBytes;

    public ImageStorageServiceImpl(StorageProperties props) {
        this.storageDir = Paths.get(props.getImageDir()).toAbsolutePath().normalize();
        this.maxFileSizeBytes = props.getMaxFileSizeBytes();
        try {
            Files.createDirectories(storageDir);
            logger.info("Image storage directory: {}", storageDir);
        } catch (IOException e) {
            throw new RuntimeException("Cannot create image storage directory: " + storageDir, e);
        }
    }

    @Override
    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Cannot store an empty file");
        }
        if (file.getSize() > maxFileSizeBytes) {
            throw new IllegalArgumentException(
                    "File size " + file.getSize() + " bytes exceeds the limit of " + maxFileSizeBytes + " bytes");
        }

        String ext = StringUtils.getFilenameExtension(file.getOriginalFilename());
        validateExtension(ext);

        String filename = UUID.randomUUID() + "." + ext.toLowerCase();
        Path target = storageDir.resolve(filename);

        try (InputStream in = file.getInputStream()) {
            Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            logger.info("Stored image file: {}", filename);
            return filename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store image file", e);
        }
    }

    @Override
    public void delete(String filename) {
        if (filename == null || filename.isBlank()) return;
        try {
            Path target = storageDir.resolve(filename).normalize();
            if (!target.startsWith(storageDir)) {
                logger.warn("Rejected delete attempt outside storage dir: {}", filename);
                return;
            }
            boolean deleted = Files.deleteIfExists(target);
            if (deleted) logger.info("Deleted image file: {}", filename);
        } catch (IOException e) {
            logger.warn("Could not delete image file: {}", filename, e);
        }
    }

    @Override
    public Path resolve(String filename) {
        return storageDir.resolve(filename).normalize();
    }

    private void validateExtension(String ext) {
        if (ext == null || !ALLOWED_EXTENSIONS.contains(ext.toLowerCase())) {
            throw new IllegalArgumentException(
                    "Unsupported file type. Accepted formats: jpg, jpeg, png, gif, webp");
        }
    }
}
