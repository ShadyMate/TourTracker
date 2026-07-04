package org.example.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * CORS configuration — allows the Angular dev server (localhost:4200) to call the API.
 */
@Configuration
public class CorsConfig {

    @Autowired
    private RequestTimingInterceptor requestTimingInterceptor;
    
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("http://localhost:4200")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(false);
            }

            @Override
            public void addInterceptors(org.springframework.web.servlet.config.annotation.InterceptorRegistry registry) {
                registry.addInterceptor(requestTimingInterceptor);
            }
        };
    }

    /**
     * Jackson 2 ObjectMapper for tour import/export. Spring Boot 4 auto-configures
     * a Jackson 3 JsonMapper for the HTTP layer but no com.fasterxml ObjectMapper,
     * so the service's mapper is declared explicitly here.
     */
    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }
}
