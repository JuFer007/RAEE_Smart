package com.raeesmart.backend.Repository;
import com.raeesmart.backend.Model.CategoriaRAEE;
import com.raeesmart.backend.Model.Enums.TipoRAEE;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository

public interface CategoriaRAEERepository extends JpaRepository<CategoriaRAEE, Long> {
    Optional<CategoriaRAEE> findByTipo(TipoRAEE tipo);
}
