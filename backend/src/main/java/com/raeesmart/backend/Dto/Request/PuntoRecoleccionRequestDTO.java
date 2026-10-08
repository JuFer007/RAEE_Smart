package com.raeesmart.backend.Dto.Request;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class PuntoRecoleccionRequestDTO {
    @NotNull(message = "La municipalidad es obligatoria")
    private Long municipalidadId;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 150)
    private String nombre;

    @NotNull(message = "La latitud es obligatoria")
    @DecimalMin(value = "-90.0")
    @DecimalMax(value = "90.0")
    private Double latitud;

    @NotNull(message = "La longitud es obligatoria")
    @DecimalMin(value = "-180.0")
    @DecimalMax(value = "180.0")
    private Double longitud;

    @Size(max = 100)
    private String horarioAtencion;

    @Min(value = 1, message = "La capacidad diaria debe ser mayor a 0")
    private Integer capacidadDiaria;
}
