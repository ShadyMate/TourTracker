package org.example.backend.exception;

/**
 * Business Layer (BL) exception for failed data operations.
 * Wraps a {@link DataAccessLayerException} so the presentation layer receives a
 * layer-appropriate error instead of a raw persistence exception.
 */
public class DatabaseOperationException extends RuntimeException {
    public DatabaseOperationException(String message, Throwable cause) {
        super(message, cause);
    }
}
