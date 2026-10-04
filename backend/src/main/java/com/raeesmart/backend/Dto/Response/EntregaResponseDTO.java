package com.raeesmart.backend.Dto.Response;
import com.raeesmart.backend.Model.Enums.EstadoEntrega;
import com.raeesmart.backend.Model.Enums.TipoRAEE;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class EntregaResponseDTO {
    private Long id;
    private TipoRAEE tipoRaee;
    private String nombreCategoriaVisible;
    private String iconoCategoria;
    private Double confianzaIa;
    private Boolean clasificacionCorregida;
    private EstadoEntrega estado;
    private String puntoRecoleccionNombre;
    private String puntoRecoleccionDireccion;
    private String certificadoCodigoQr;
    private LocalDateTime fechaRegistro;
}
