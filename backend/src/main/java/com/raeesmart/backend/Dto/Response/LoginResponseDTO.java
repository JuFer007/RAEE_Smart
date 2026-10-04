package com.raeesmart.backend.Dto.Response;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class LoginResponseDTO {
    private String token;
    private UsuarioResponseDTO usuario;
}
