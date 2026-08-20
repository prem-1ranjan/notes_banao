package com.notesbanao.portal.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * The front end runs on a different port, so every call is cross-origin and
 * carries the session cookie. That combination needs an explicit origin list
 * (never "*") plus allowCredentials, or the browser drops the response.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    private final PortalProperties properties;

    public CorsConfig(PortalProperties properties) {
        this.properties = properties;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(properties.getCors().getAllowedOrigins().toArray(String[]::new))
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("ETag")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
