package com.raeesmart.backend.Dto.Response;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class PuntoRecoleccionResponseDTO {
    private Long id;
    private String nombre;
    private Double latitud;
    private Double longitud;
    private String horarioAtencion;
}
