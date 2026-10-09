package com.raeesmart.backend.Dto.Response;
import com.raeesmart.backend.Model.Enums.RolUsuario;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class UsuarioResponseDTO {
    private Long id;
    private String nombre;
    private String email;
    private String dni;
    private String telefono;
    private RolUsuario rol;
}
