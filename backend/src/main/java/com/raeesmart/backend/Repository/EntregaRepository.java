package com.raeesmart.backend.Repository;
import com.raeesmart.backend.Model.Entrega;
import com.raeesmart.backend.Model.Enums.EstadoEntrega;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository

public interface EntregaRepository extends JpaRepository<Entrega, Long> {
    List<Entrega> findByUsuarioIdOrderByFechaRegistroDesc(Long usuarioId);
    List<Entrega> findByEstado(EstadoEntrega estado);
    List<Entrega> findByPuntoRecoleccionMunicipalidadId(Long municipalidadId);
}
