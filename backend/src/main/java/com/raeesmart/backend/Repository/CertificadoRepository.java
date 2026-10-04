package com.raeesmart.backend.Repository;
import com.raeesmart.backend.Model.Certificado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository

public interface CertificadoRepository extends JpaRepository<Certificado, Long> {
    Optional<Certificado> findByEntregaId(Long entregaId);
    Optional<Certificado> findByCodigoHash(String codigoHash);
}
