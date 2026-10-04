package com.raeesmart.backend.Repository;
import com.raeesmart.backend.Model.Municipalidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository

public interface MunicipalidadRepository extends JpaRepository<Municipalidad, Long> {
    List<Municipalidad> findByActivoTrue();
    List<Municipalidad> findByDistritoIgnoreCase(String distrito);
}
