package com.raeesmart.backend.Dto.Response;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class CertificadoResponseDTO {
    private Long id;
    private Long entregaId;
    private String codigoHash;
    private String codigoQr;
    private String qrImagenBase64;
    private String tipoAparato;
    private String nombreCategoria;
    private String iconoCategoria;
    private String puntoEntregaNombre;
    private LocalDateTime fechaEmision;
    private LocalDateTime fechaEntrega;
    private String urlPdf;
}
