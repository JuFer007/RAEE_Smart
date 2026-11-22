package com.raeesmart.backend.Dto.Response;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class ValoracionAppResponseDTO {
    private Long id;
    private Integer calificacion;
    private String comentario;
    private LocalDateTime fechaRegistro;
    private LocalDateTime fechaActualizacion;
    private String ciudadanoNombre;
    private Long municipalidadId;
    private String municipalidadNombre;
}
