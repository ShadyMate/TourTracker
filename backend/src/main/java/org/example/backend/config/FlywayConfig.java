package org.example.backend.config;

import org.flywaydb.core.Flyway;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
public class FlywayConfig {
    private static final Logger logger = LoggerFactory.getLogger(FlywayConfig.class);

    @Bean(initMethod = "migrate")
    public Flyway flyway(DataSource dataSource) {
        logger.info("Configuring Flyway migrations...");
        return Flyway.configure()
                .dataSource(dataSource)
                .locations("classpath:db/migration")
                .baselineOnMigrate(false)
                .load();
    }
}
