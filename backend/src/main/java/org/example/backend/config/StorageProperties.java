package org.example.backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.storage")
@Data
public class StorageProperties {
    /** Absolute or relative path where tour map images are written. */
    private String imageDir = "./tour-images";

    /** Maximum accepted image file size in bytes (default 10 MB). */
    private long maxFileSizeBytes = 10 * 1024 * 1024;
}
