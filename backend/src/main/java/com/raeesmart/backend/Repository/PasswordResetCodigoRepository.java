package com.raeesmart.backend.Repository;

import com.raeesmart.backend.Model.PasswordResetCodigo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PasswordResetCodigoRepository extends JpaRepository<PasswordResetCodigo, Long> {
    Optional<PasswordResetCodigo> findTopByEmailAndUsadoEnIsNullOrderByCreadoEnDesc(String email);

    List<PasswordResetCodigo> findByEmailAndUsadoEnIsNull(String email);
}
