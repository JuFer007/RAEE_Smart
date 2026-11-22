package com.raeesmart.backend.Dto.Response;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class AuditoriaEventoResponseDTO {
    private Long id;
    private Instant fechaHora;
    private Long actorId;
    private String actorEmail;
    private String actorNombre;
    private String actorRol;
    private Long actorMunicipalidadId;
    private String actorMunicipalidadNombre;
    private String accion;
    private String entidad;
    private String entidadId;
    private String detalles;
    private String resultado;
    private String origen;
    private String endpoint;
    private String metodoHttp;
}
