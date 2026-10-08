package com.raeesmart.backend.Dto.Request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class CampanaRequestDTO {
    @NotNull(message = "La municipalidad es obligatoria")
    private Long municipalidadId;

    @NotBlank(message = "El título es obligatorio")
    @Size(max = 150)
    private String titulo;

    @Size(max = 500)
    private String descripcion;

    @Size(max = 200)
    private String lugar;

    @Size(max = 100)
    private String horario;

    @NotNull(message = "La fecha de inicio es obligatoria")
    private LocalDate fechaInicio;

    @NotNull(message = "La fecha de fin es obligatoria")
    private LocalDate fechaFin;

    private Boolean activa;
}
