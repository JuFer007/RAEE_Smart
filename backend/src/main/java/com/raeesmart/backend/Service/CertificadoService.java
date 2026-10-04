package com.raeesmart.backend.Service;
import com.raeesmart.backend.Model.Certificado;
import com.raeesmart.backend.Model.Entrega;

public interface CertificadoService {
    Certificado generarCertificado(Entrega entrega);
    Certificado verificarPorHash(String codigoHash);
    Certificado obtenerPorEntrega(Long entregaId);
}
