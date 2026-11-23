package com.raeesmart.backend.Dto.Request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerificarCodigoRequestDTO {
    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El correo no es válido")
    private String email;

    @NotBlank(message = "El código es obligatorio")
    @Pattern(regexp = "\\d{6}", message = "El código debe tener 6 dígitos")
    private String codigo;
}
