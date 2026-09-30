package com.raeesmart.backend.Model;
import com.raeesmart.backend.Model.Enums.EstadoEntrega;
import com.raeesmart.backend.Model.Enums.TipoRAEE;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "entregas")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class Entrega {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_raee", nullable = false, length = 40)
    private TipoRAEE tipoRaee;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_corregido", length = 40)
    private TipoRAEE tipoCorregido;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "punto_recoleccion_id", nullable = false)
    private PuntoRecoleccion puntoRecoleccion;

    @Column(name = "foto_url", nullable = false, length = 300)
    private String fotoUrl;

    @Column(name = "confianza_ia", nullable = false)
    private Double confianzaIa;

    @Column(name = "clasificacion_corregida", nullable = false)
    @Builder.Default
    private Boolean clasificacionCorregida = false;

    @Column(name = "latitud_usuario", nullable = false)
    private Double latitudUsuario;

    @Column(name = "longitud_usuario", nullable = false)
    private Double longitudUsuario;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private EstadoEntrega estado = EstadoEntrega.REGISTRADA;

    @Column(name = "fecha_registro", nullable = false, updatable = false)
    private LocalDateTime fechaRegistro;

    @Column(name = "fecha_confirmacion")
    private LocalDateTime fechaConfirmacion;

    @OneToOne(mappedBy = "entrega", cascade = CascadeType.ALL, orphanRemoval = true)
    private Certificado certificado;

    @OneToOne(mappedBy = "entrega", cascade = CascadeType.ALL, orphanRemoval = true)
    private ReporteIA reporteIA;

    @PrePersist
    public void prePersist() {
        if (this.fechaRegistro == null) {
            this.fechaRegistro = LocalDateTime.now();
        }
        if (this.estado == null) {
            this.estado = EstadoEntrega.REGISTRADA;
        }
    }
}
