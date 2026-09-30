package com.raeesmart.backend.Model;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "reportes_ia")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class ReporteIA {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "entrega_id", nullable = false, unique = true)
    private Entrega entrega;

    @Column(name = "version_modelo", nullable = false, length = 50)
    private String versionModelo;

    @Column(name = "prediccion_top1", nullable = false, length = 100)
    private String prediccionTop1;

    @Column(nullable = false)
    private Double confianza;

    @Column(name = "tiempo_inferencia_ms")
    private Integer tiempoInferenciaMs;
}
