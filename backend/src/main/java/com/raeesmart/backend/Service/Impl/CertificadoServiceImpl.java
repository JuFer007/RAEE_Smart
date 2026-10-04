package com.raeesmart.backend.Service.Impl;
import com.raeesmart.backend.Exception.ResourceNotFoundException;
import com.raeesmart.backend.Model.Certificado;
import com.raeesmart.backend.Model.Entrega;
import com.raeesmart.backend.Repository.CertificadoRepository;
import com.raeesmart.backend.Service.CertificadoService;
import com.raeesmart.backend.Service.QRService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service

public class CertificadoServiceImpl implements CertificadoService {
    private final CertificadoRepository certificadoRepository;
    private final QRService qrService;
    private final String verificacionBaseUrl;

    public CertificadoServiceImpl(CertificadoRepository certificadoRepository, QRService qrService,
    @Value("${raeesmart.certificado.verificacion-base-url}") String verificacionBaseUrl) {
        this.certificadoRepository = certificadoRepository;
        this.qrService = qrService;
        this.verificacionBaseUrl = verificacionBaseUrl;
    }

    @Override
    public Certificado generarCertificado(Entrega entrega) {
        String codigoHash = qrService.generarCodigoHash();
        String contenidoQr = verificacionBaseUrl + "/" + codigoHash;

        Certificado certificado = Certificado.builder()
                .entrega(entrega)
                .codigoQr(contenidoQr)
                .codigoHash(codigoHash)
                .build();

        return certificadoRepository.save(certificado);
    }

    @Override
    public Certificado verificarPorHash(String codigoHash) {
        return certificadoRepository.findByCodigoHash(codigoHash).orElseThrow(() -> new ResourceNotFoundException("Certificado no encontrado o inválido"));
    }

    @Override
    public Certificado obtenerPorEntrega(Long entregaId) {
        return certificadoRepository.findByEntregaId(entregaId)
                .orElseThrow(() -> new ResourceNotFoundException("La entrega no tiene certificado generado"));
    }
}
