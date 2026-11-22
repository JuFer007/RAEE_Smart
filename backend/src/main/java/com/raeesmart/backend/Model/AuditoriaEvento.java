package com.raeesmart.backend.Model;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;

@Entity
@Table(name = "auditoria_evento", indexes = {
        @Index(name = "idx_auditoria_fecha", columnList = "fecha_hora"),
        @Index(name = "idx_auditoria_entidad", columnList = "entidad, entidad_id, fecha_hora"),
        @Index(name = "idx_auditoria_actor", columnList = "actor_id, fecha_hora"),
        @Index(name = "idx_auditoria_accion", columnList = "accion, fecha_hora")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class AuditoriaEvento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "fecha_hora", nullable = false)
    private Instant fechaHora;

    @Column(name = "actor_id")
    private Long actorId;

    @Column(name = "actor_email", length = 150)
    private String actorEmail;

    @Column(name = "actor_nombre", length = 150)
    private String actorNombre;

    @Column(name = "actor_rol", length = 20)
    private String actorRol;

    @Column(name = "actor_municipalidad_id")
    private Long actorMunicipalidadId;

    @Column(name = "actor_municipalidad_nombre", length = 150)
    private String actorMunicipalidadNombre;

    @Column(nullable = false, length = 80)
    private String accion;

    @Column(nullable = false, length = 80)
    private String entidad;

    @Column(name = "entidad_id", length = 100)
    private String entidadId;

    @Column(columnDefinition = "TEXT")
    private String detalles;

    @Column(nullable = false, length = 20)
    private String resultado;

    @Column(length = 20)
    private String origen;

    @Column(length = 255)
    private String endpoint;

    @Column(name = "metodo_http", length = 10)
    private String metodoHttp;

    @PrePersist
    public void prePersist() {
        if (this.fechaHora == null) {
            this.fechaHora = Instant.now();
        }
        if (this.resultado == null || this.resultado.isBlank()) {
            this.resultado = "EXITOSO";
        }
        if (this.origen == null || this.origen.isBlank()) {
            this.origen = "SISTEMA";
        }
    }
}
