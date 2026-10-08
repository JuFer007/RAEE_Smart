package com.raeesmart.backend.Dto.Response;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class CampanaResponseDTO {
    private Long id;
    private Long municipalidadId;
    private String municipalidadNombre;
    private String titulo;
    private String descripcion;
    private String lugar;
    private String horario;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private Boolean activa;
    private String estado;
}
