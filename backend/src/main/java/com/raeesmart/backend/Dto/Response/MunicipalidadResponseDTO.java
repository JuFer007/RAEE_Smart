package com.raeesmart.backend.Dto.Response;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class MunicipalidadResponseDTO {
    private Long id;
    private String nombre;
    private String distrito;
    private String direccion;
    private Double latitud;
    private Double longitud;
    private String contactoEmail;
    private Boolean activo;
    private Boolean campanasHabilitadas;
}


