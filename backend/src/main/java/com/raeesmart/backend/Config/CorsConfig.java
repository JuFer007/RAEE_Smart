package com.raeesmart.backend.Config;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;
import java.util.List;

@Configuration

public class CorsConfig {
    @Value("${raeesmart.cors.allowed-origins}")
    private String origenesPermitidos;

    @Value("${raeesmart.cors.allowed-origin-patterns:}")
    private String patronesOrigenPermitidos;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        List<String> origenes = origenesPermitidos == null ? List.of() : Arrays.stream(origenesPermitidos.split(","))
                .map(String::trim)
                .filter(origen -> !origen.isEmpty())
                .toList();
        if (!origenes.isEmpty()) {
            configuration.setAllowedOrigins(origenes);
        }

        List<String> patrones = patronesOrigenPermitidos == null ? List.of() : Arrays.stream(patronesOrigenPermitidos.split(","))
                .map(String::trim)
                .filter(patron -> !patron.isEmpty())
                .toList();
        if (!patrones.isEmpty()) {
            configuration.setAllowedOriginPatterns(patrones);
        }

        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}
