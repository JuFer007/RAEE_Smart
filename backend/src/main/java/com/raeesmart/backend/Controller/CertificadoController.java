package com.raeesmart.backend.Controller;
import com.raeesmart.backend.Dto.Response.CertificadoResponseDTO;
import com.raeesmart.backend.Model.CategoriaRAEE;
import com.raeesmart.backend.Model.Certificado;
import com.raeesmart.backend.Model.Entrega;
import com.raeesmart.backend.Model.Enums.TipoRAEE;
import com.raeesmart.backend.Repository.CategoriaRAEERepository;
import com.raeesmart.backend.Service.CertificadoService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/certificados")

public class CertificadoController {
    private final CertificadoService certificadoService;
    private final CategoriaRAEERepository categoriaRAEERepository;

    public CertificadoController(CertificadoService certificadoService,
                                 CategoriaRAEERepository categoriaRAEERepository) {
        this.certificadoService = certificadoService;
        this.categoriaRAEERepository = categoriaRAEERepository;
    }

    @GetMapping("/entrega/{entregaId}")
    public CertificadoResponseDTO obtenerPorEntrega(@PathVariable Long entregaId) {
        return mapearAResponse(certificadoService.obtenerPorEntrega(entregaId));
    }

    @GetMapping("/verificar/{codigoHash}")
    public CertificadoResponseDTO verificar(@PathVariable String codigoHash) {
        return mapearAResponse(certificadoService.verificarPorHash(codigoHash));
    }

    private CertificadoResponseDTO mapearAResponse(Certificado certificado) {
        Entrega entrega = certificado.getEntrega();
        TipoRAEE tipoFinal = Boolean.TRUE.equals(entrega.getClasificacionCorregida())
                ? entrega.getTipoCorregido()
                : entrega.getTipoRaee();

        CategoriaRAEE metadata = categoriaRAEERepository.findByTipo(tipoFinal).orElse(null);

        return CertificadoResponseDTO.builder()
                .id(certificado.getId())
                .entregaId(entrega.getId())
                .codigoHash(certificado.getCodigoHash())
                .codigoQr(certificado.getCodigoQr())
                .tipoAparato(metadata != null ? metadata.getNombreVisible() : tipoFinal.name())
                .nombreCategoria(metadata != null ? metadata.getNombreVisible() : tipoFinal.name())
                .iconoCategoria(metadata != null ? metadata.getIconoUrl() : null)
                .puntoEntregaNombre(entrega.getPuntoRecoleccion().getNombre())
                .fechaEmision(certificado.getFechaEmision())
                .fechaEntrega(entrega.getFechaRegistro())
                .urlPdf(certificado.getUrlPdf())
                .build();
    }
}
