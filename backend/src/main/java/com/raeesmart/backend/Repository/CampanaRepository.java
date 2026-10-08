package com.raeesmart.backend.Repository;
import com.raeesmart.backend.Model.Campana;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository

public interface CampanaRepository extends JpaRepository<Campana, Long> {
    List<Campana> findByMunicipalidadIdOrderByFechaInicioDesc(Long municipalidadId);
    List<Campana> findByMunicipalidadIdAndActivaTrueAndFechaFinGreaterThanEqualOrderByFechaInicioAsc(Long municipalidadId, LocalDate hoy);
}

