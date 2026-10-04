package com.raeesmart.backend.Dto.Request;
import com.raeesmart.backend.Model.Enums.TipoRAEE;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class CorreccionRequestDTO {
    @NotNull(message = "Debes indicar la categoría correcta")
    private TipoRAEE tipoCorregido;
}
