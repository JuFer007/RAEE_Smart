package com.raeesmart.backend.Dto.Response;
import com.raeesmart.backend.Model.Enums.TipoNotificacion;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class NotificacionResponseDTO {
    private Long id;
    private String titulo;
    private String detalle;
    private TipoNotificacion tipo;
    private Boolean leida;
    private LocalDateTime fechaCreacion;
}
