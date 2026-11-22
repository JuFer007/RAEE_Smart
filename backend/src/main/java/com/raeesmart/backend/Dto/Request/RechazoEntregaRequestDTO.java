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

public class RechazoEntregaRequestDTO {
    @NotBlank(message = "El motivo del rechazo es obligatorio")
    @Size(max = 300)
    private String motivo;
}
