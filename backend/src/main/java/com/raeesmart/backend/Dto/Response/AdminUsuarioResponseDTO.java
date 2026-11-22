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

public class AdminUsuarioResponseDTO {
    private Long id;
    private String nombre;
    private String email;
    private String dni;
    private String telefono;
    private String rol;
    private Long municipalidadId;
    private String municipalidadNombre;
    private Boolean activo;
    private LocalDateTime ultimoAcceso;
    private LocalDateTime fechaRegistro;
}
