package org.example.backend.service;

import org.example.backend.exception.DataAccessExceptionAspect;
import org.example.backend.exception.DataAccessLayerException;
import org.example.backend.exception.DatabaseOperationException;
import org.junit.jupiter.api.Test;
import org.springframework.aop.aspectj.annotation.AspectJProxyFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataAccessResourceFailureException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertThrows;

/**
 * Verifies the DAL→BL exception translation: a Spring DataAccessException thrown
 * from a Business Layer method is wrapped in a DatabaseOperationException (BL) whose
 * cause is a DataAccessLayerException (DAL) — so the presentation layer never sees a
 * raw persistence exception.
 *
 * <p>The stub lives in {@code org.example.backend.service} so it matches the aspect's
 * pointcut without needing a database.
 */
class DataAccessExceptionAspectTest {

    /** Stands in for a BL service whose underlying repository call hit a DB failure. */
    interface SampleService {
        String load();
        String ok();
    }

    static class FailingService implements SampleService {
        @Override
        public String load() {
            throw new DataAccessResourceFailureException("connection refused");
        }

        @Override
        public String ok() {
            return "value";
        }
    }

    private SampleService proxied() {
        AspectJProxyFactory factory = new AspectJProxyFactory(new FailingService());
        factory.addAspect(new DataAccessExceptionAspect());
        return factory.getProxy();
    }

    @Test
    void wrapsDataAccessExceptionInBusinessLayerException() {
        DatabaseOperationException ex =
                assertThrows(DatabaseOperationException.class, () -> proxied().load());

        Throwable dal = ex.getCause();
        assertInstanceOf(DataAccessLayerException.class, dal);
        assertInstanceOf(DataAccessException.class, dal.getCause());
    }

    @Test
    void passesSuccessfulCallsThrough() {
        assertEquals("value", proxied().ok());
    }
}
