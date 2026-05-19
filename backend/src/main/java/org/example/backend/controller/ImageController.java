package org.example.backend.controller;

import org.example.backend.service.ImageStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * Presentation Layer - ImageController
 * Serves stored tour map images from the filesystem.
 * Authentication is not required so Angular can load images in <img> tags
 * without attaching Bearer tokens — files are identified by UUID names only.
 */
@RestController
@RequestMapping("/images")
public class ImageController {
    private static final Logger logger = LoggerFactory.getLogger(ImageController.class);
    private final ImageStorageService imageStorageService;

    public ImageController(ImageStorageService imageStorageService) {
        this.imageStorageService = imageStorageService;
    }

    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> serveImage(@PathVariable String filename) {
        Path path = imageStorageService.resolve(filename);
        Resource resource = new FileSystemResource(path);

        if (!resource.exists() || !resource.isReadable()) {
            logger.warn("Image not found: {}", filename);
            return ResponseEntity.notFound().build();
        }

        String contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        try {
            String detected = Files.probeContentType(path);
            if (detected != null) contentType = detected;
        } catch (IOException ignored) {
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }
}
