package com.raeesmart.backend.Model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "password_reset_codigo")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PasswordResetCodigo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String email;

    @Column(name = "codigo_hash", nullable = false, length = 64)
    private String codigoHash;

    @Column(name = "creado_en", nullable = false)
    private LocalDateTime creadoEn;

    @Column(name = "expira_en", nullable = false)
    private LocalDateTime expiraEn;

    @Column(name = "verificado_en")
    private LocalDateTime verificadoEn;

    @Column(name = "usado_en")
    private LocalDateTime usadoEn;

    @Builder.Default
    @Column(nullable = false)
    private Integer intentos = 0;

    @PrePersist
    public void prePersist() {
        if (creadoEn == null) {
            creadoEn = LocalDateTime.now();
        }
        if (intentos == null) {
            intentos = 0;
        }
    }
}
