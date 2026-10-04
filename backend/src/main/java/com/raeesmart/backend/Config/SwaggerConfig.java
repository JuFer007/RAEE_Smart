package com.raeesmart.backend.Config;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration

public class SwaggerConfig {
    private static final String ESQUEMA_JWT = "bearerAuth";

    @Bean
    public OpenAPI raeeSmartOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("RAEE SMART API")
                        .description("Gestión inteligente de residuos electrónicos en Chiclayo. "
                                + "Backend para la app móvil (ciudadano) y el panel municipal.")
                        .version("v1.0")
                        .contact(new Contact()
                                .name("Equipo RAEE SMART")
                                .email("contacto@raeesmart.pe")))
                .addSecurityItem(new SecurityRequirement().addList(ESQUEMA_JWT))
                .components(new Components()
                        .addSecuritySchemes(ESQUEMA_JWT, new SecurityScheme()
                                .name(ESQUEMA_JWT)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Pega acá el token que devuelve POST /api/auth/login "
                                        + "(sin la palabra 'Bearer', Swagger la agrega sola)")));
    }
}
