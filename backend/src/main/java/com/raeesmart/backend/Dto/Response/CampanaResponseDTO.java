package com.raeesmart.backend.Dto.Response;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

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
    private Long puntoRecoleccionId;
    private String puntoRecoleccionNombre;
    private String horario;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private Boolean activa;
    private String estado;
    private String motivoDesactivacion;
    private LocalDateTime fechaDesactivacion;
    private String desactivadaPor;
}
