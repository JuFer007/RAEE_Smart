package com.raeesmart.backend.Repository;
import com.raeesmart.backend.Model.ValoracionApp;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository

public interface ValoracionAppRepository extends JpaRepository<ValoracionApp, Long> {
    @EntityGraph(attributePaths = {"usuario", "usuario.municipalidad"})
    Optional<ValoracionApp> findByUsuarioId(Long usuarioId);

    @EntityGraph(attributePaths = {"usuario", "usuario.municipalidad"})
    List<ValoracionApp> findAllByOrderByFechaRegistroDesc();

    @EntityGraph(attributePaths = {"usuario", "usuario.municipalidad"})
    List<ValoracionApp> findByUsuarioMunicipalidadIdOrderByFechaRegistroDesc(Long municipalidadId);
}
