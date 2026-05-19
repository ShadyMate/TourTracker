package org.example.backend.service;

import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;

/**
 * Business Layer - ImageStorageService
 * Abstracts filesystem image persistence so the rest of the application
 * never deals with paths or IO directly.
 */
public interface ImageStorageService {

    /**
     * Persist the uploaded file and return the generated filename.
     * Only image content types (jpg, jpeg, png, gif, webp) are accepted.
     */
    String store(MultipartFile file);

    /**
     * Delete the file identified by filename. No-op if the file does not exist.
     */
    void delete(String filename);

    /**
     * Resolve a stored filename to its absolute filesystem path.
     */
    Path resolve(String filename);
}
