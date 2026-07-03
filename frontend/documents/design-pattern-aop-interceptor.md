# Design Pattern: Proxy / Interceptor (Spring AOP)

**Where:** `backend/src/main/java/org/example/backend/exception/DataAccessExceptionAspect.java`

## Pattern

The application uses the **Proxy** pattern in its **Interceptor** form, realised
through Spring AOP. Every Business-Layer bean in `org.example.backend.service`
is not injected directly; at startup Spring wraps each one in a dynamically
generated **proxy** object. Calls to a service method go through the proxy
first, which lets cross-cutting behaviour run *around* the real method without
the caller or the method itself knowing about it.

`DataAccessExceptionAspect` is that around-advice (the interceptor). It sits on
the boundary between the Data Access Layer and the Business Layer and translates
low-level persistence failures into layer-appropriate exceptions.

## Why it was used

The layered-architecture requirement states that each layer must define its own
exceptions and must not leak implementation-specific exceptions upward. Spring
Data throws `DataAccessException` (lost connection, constraint violation,
timeout, …). Without interception we would have to wrap every repository call in
a `try/catch` inside every service method.

The interceptor solves this in **one place**: it catches any
`DataAccessException` thrown anywhere in the service layer, represents it as a
DAL exception (`DataAccessLayerException`), and wraps that in a BL exception
(`DatabaseOperationException`). The presentation layer therefore never sees a
raw persistence exception, and the business methods stay free of boilerplate.

## How it works

```java
@Aspect
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class DataAccessExceptionAspect {

    @Around("execution(* org.example.backend.service..*(..))")
    public Object wrapDataAccessErrors(ProceedingJoinPoint joinPoint) throws Throwable {
        try {
            return joinPoint.proceed();               // call the real service method
        } catch (DataAccessException ex) {
            DataAccessLayerException dal = new DataAccessLayerException(
                "Data access failed in " + joinPoint.getSignature().toShortString(), ex);
            logger.error(dal.getMessage(), ex);
            throw new DatabaseOperationException(
                "The operation could not be completed due to a database error.", dal);
        }
    }
}
```

- The pointcut `execution(* org.example.backend.service..*(..))` selects every
  method of every Business-Layer class.
- `@Around` advice wraps the call: `joinPoint.proceed()` invokes the real method;
  the surrounding `try/catch` performs the exception translation.
- `HIGHEST_PRECEDENCE` places the advice **outside** Spring's transactional
  advice, so failures that surface at commit time are caught as well.

## Benefit

Cross-cutting exception translation is defined once, applied uniformly to the
whole Business Layer, and keeps the layer boundary clean — no persistence
exception ever reaches the presentation layer, and no service method contains
error-translation boilerplate. Verified by `DataAccessExceptionAspectTest`,
which proves that a `DataAccessException` is wrapped and that non-DB exceptions
pass through untouched.
