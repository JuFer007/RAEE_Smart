package com.raeesmart.backend.Dto.Request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReenviarCodigoRequestDTO {
    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El correo no es válido")
    private String email;
}
