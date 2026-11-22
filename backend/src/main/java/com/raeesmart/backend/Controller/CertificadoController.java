package com.raeesmart.backend.Controller;
import com.raeesmart.backend.Dto.Response.CertificadoResponseDTO;
import com.raeesmart.backend.Model.CategoriaRAEE;
import com.raeesmart.backend.Model.Certificado;
import com.raeesmart.backend.Model.Entrega;
import com.raeesmart.backend.Model.Enums.TipoRAEE;
import com.raeesmart.backend.Model.Usuario;
import com.raeesmart.backend.Repository.CategoriaRAEERepository;
import com.raeesmart.backend.Service.CertificadoService;
import com.raeesmart.backend.Service.EntregaService;
import com.raeesmart.backend.Service.QRService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Base64;

@RestController
@RequestMapping("/api/certificados")

public class CertificadoController {
    private final CertificadoService certificadoService;
    private final CategoriaRAEERepository categoriaRAEERepository;
    private final EntregaService entregaService;
    private final QRService qrService;
    private final String pdfBaseUrl;

    public CertificadoController(CertificadoService certificadoService,
                                 CategoriaRAEERepository categoriaRAEERepository,
                                 EntregaService entregaService,
                                 QRService qrService,
                                 @Value("${raeesmart.certificado.pdf-base-url}") String pdfBaseUrl) {
        this.certificadoService = certificadoService;
        this.categoriaRAEERepository = categoriaRAEERepository;
        this.entregaService = entregaService;
        this.qrService = qrService;
        this.pdfBaseUrl = pdfBaseUrl;
    }

    @GetMapping("/entrega/{entregaId}")
    public CertificadoResponseDTO obtenerPorEntrega(@PathVariable Long entregaId) {
        entregaService.buscarPorId(entregaId);
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
        Usuario titular = entrega.getUsuario();

        String urlPdf = certificado.getUrlPdf();
        if (urlPdf == null || urlPdf.isBlank()) {
            urlPdf = pdfBaseUrl.replaceAll("/+$", "") + "/certificado/" + certificado.getCodigoHash() + "/pdf";
        }

        return CertificadoResponseDTO.builder()
                .id(certificado.getId())
                .entregaId(entrega.getId())
                .codigoHash(certificado.getCodigoHash())
                .codigoQr(certificado.getCodigoQr())
                .qrImagenBase64(Base64.getEncoder().encodeToString(qrService.generarQR(certificado.getCodigoQr())))
                .tipoAparato(metadata != null ? metadata.getNombreVisible() : tipoFinal.name())
                .nombreCategoria(metadata != null ? metadata.getNombreVisible() : tipoFinal.name())
                .iconoCategoria(metadata != null ? metadata.getIconoUrl() : null)
                .personaNombre(titular != null ? titular.getNombre() : null)
                .personaDni(titular != null ? titular.getDni() : null)
                .puntoEntregaNombre(entrega.getPuntoRecoleccion().getNombre())
                .fechaEmision(certificado.getFechaEmision())
                .fechaEntrega(entrega.getFechaRegistro())
                .urlPdf(urlPdf)
                .build();
    }
}
