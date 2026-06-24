package org.example.backend.exception;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Component;

/**
 * Translates Data Access Layer failures into Business Layer exceptions.
 *
 * <p>Spring's persistence layer throws {@link DataAccessException} (DB connection
 * lost, constraint violation, timeout, ...). This aspect runs around every Business
 * Layer method ({@code org.example.backend.service..*}) and, on such a failure,
 * represents it as a {@link DataAccessLayerException} (DAL) and wraps it in a
 * {@link DatabaseOperationException} (BL). The presentation layer therefore never
 * sees a raw persistence exception.
 *
 * <p>{@code HIGHEST_PRECEDENCE} places this advice outside Spring's transactional
 * advice, so errors surfaced at commit time are caught too.
 */
@Aspect
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class DataAccessExceptionAspect {
    private static final Logger logger = LoggerFactory.getLogger(DataAccessExceptionAspect.class);

    @Around("execution(* org.example.backend.service..*(..))")
    public Object wrapDataAccessErrors(ProceedingJoinPoint joinPoint) throws Throwable {
        try {
            return joinPoint.proceed();
        } catch (DataAccessException ex) {
            // DAL boundary: represent the raw persistence failure as our DAL exception.
            DataAccessLayerException dalException = new DataAccessLayerException(
                    "Data access failed in " + joinPoint.getSignature().toShortString(), ex);
            logger.error(dalException.getMessage(), ex);
            // BL boundary: wrap it so the presentation layer gets a layer-appropriate error.
            throw new DatabaseOperationException(
                    "The operation could not be completed due to a database error.", dalException);
        }
    }
}
