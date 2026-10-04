package com.raeesmart.backend.Repository;
import com.raeesmart.backend.Model.PuntoRecoleccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository

public interface PuntoRecoleccionRepository extends JpaRepository<PuntoRecoleccion, Long> {
    List<PuntoRecoleccion> findByMunicipalidadId(Long municipalidad);
    List<PuntoRecoleccion> findByMunicipalidadActivoTrue();
}
