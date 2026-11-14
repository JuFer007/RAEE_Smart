package com.raeesmart.backend.Dto.Response;
import com.raeesmart.backend.Model.Enums.TipoRAEE;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class PrediccionCategoriaDTO {
    private TipoRAEE categoria;
    private Double confianza;
}
