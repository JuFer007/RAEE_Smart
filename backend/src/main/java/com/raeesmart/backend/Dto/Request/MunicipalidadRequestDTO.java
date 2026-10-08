package com.raeesmart.backend.Dto.Request;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class MunicipalidadRequestDTO {
    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 150)
    private String nombre;

    @NotBlank(message = "El distrito es obligatorio")
    @Size(max = 100)
    private String distrito;

    @Size(max = 250)
    private String direccion;

    @NotNull
    @DecimalMin("-90.0")
    @DecimalMax("90.0")
    private Double latitud;

    @NotNull
    @DecimalMin("-180.0")
    @DecimalMax("180.0")
    private Double longitud;

    @Email
    @Size(max = 150)
    private String contactoEmail;

    private Boolean activo;

    private Boolean campanasHabilitadas;
}
