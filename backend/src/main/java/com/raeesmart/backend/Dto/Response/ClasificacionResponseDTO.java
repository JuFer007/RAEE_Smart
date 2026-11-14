package com.raeesmart.backend.Dto.Response;
import com.raeesmart.backend.Model.Enums.TipoRAEE;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class ClasificacionResponseDTO {
    private TipoRAEE tipoDetectado;
    private Double confianza;
    private Integer tiempoInferenciaMs;
    private List<PrediccionCategoriaDTO> alternativas;
}
