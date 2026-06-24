package org.example.backend.exception;

/**
 * Data Access Layer (DAL) exception.
 * Represents a failure originating in the persistence layer — e.g. a lost DB
 * connection, constraint violation, or query timeout. The Business Layer catches
 * this and re-throws a {@link DatabaseOperationException} so that raw persistence
 * errors never reach the presentation layer.
 */
public class DataAccessLayerException extends RuntimeException {
    public DataAccessLayerException(String message, Throwable cause) {
        super(message, cause);
    }
}
