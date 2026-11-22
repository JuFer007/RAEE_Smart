package com.raeesmart.backend.Config;
import com.raeesmart.backend.Security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@EnableWebSecurity
@Configuration

public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> {})
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(errores -> errores
                        .authenticationEntryPoint((solicitud, respuesta, excepcion) -> {
                            respuesta.setStatus(401);
                            respuesta.setCharacterEncoding("UTF-8");
                            respuesta.setContentType("application/json");
                            respuesta.getWriter().write(
                                    "{\"error\":\"Unauthorized\",\"mensaje\":\"Tu sesión expiró o el token no es válido\",\"ruta\":\""
                                            + solicitud.getRequestURI() + "\"}");
                        })
                        .accessDeniedHandler((solicitud, respuesta, excepcion) -> {
                            respuesta.setStatus(403);
                            respuesta.setCharacterEncoding("UTF-8");
                            respuesta.setContentType("application/json");
                            respuesta.getWriter().write(
                                    "{\"error\":\"Forbidden\",\"mensaje\":\"No tienes permisos para realizar esta acción\",\"ruta\":\""
                                            + solicitud.getRequestURI() + "\"}");
                        }))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/me").authenticated()
                        .requestMatchers("/api/auth/login", "/api/auth/login/movil", "/api/auth/registro").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/municipalidades/puntos", "/api/municipalidades/*/puntos").permitAll()
                        .requestMatchers("/api/municipalidades/*/campanas", "/api/municipalidades/campanas/*").permitAll()
                        .requestMatchers("/api/certificados/verificar/**").permitAll()
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        .requestMatchers("/api/admin/municipalidades/**", "/api/admin/satisfaccion/**").hasRole("ADMIN")
                        .requestMatchers("/api/admin/puntos/**", "/api/admin/campanas/**", "/api/admin/usuarios/**")
                        .hasAnyRole("MUNICIPALIDAD", "ADMIN")
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/entregas/*/confirmar", "/api/entregas/*/rechazar")
                        .hasAnyRole("MUNICIPALIDAD", "ADMIN")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
