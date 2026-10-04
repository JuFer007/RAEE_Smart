package com.raeesmart.backend.Repository;
import com.raeesmart.backend.Model.ReporteIA;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository

public interface ReporteIARepository extends JpaRepository<ReporteIA, Long> {
    Optional<ReporteIA> findByEntregaId(Long entregaId);
}
