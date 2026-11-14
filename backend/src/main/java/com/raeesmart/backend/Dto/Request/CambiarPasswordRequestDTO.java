package com.raeesmart.backend.Dto.Request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class CambiarPasswordRequestDTO {
    @NotBlank(message = "La contrasena actual es obligatoria")
    private String passwordActual;

    @NotBlank(message = "La nueva contrasena es obligatoria")
    @Size(min = 6, message = "La nueva contrasena debe tener al menos 6 caracteres")
    private String passwordNueva;
}
