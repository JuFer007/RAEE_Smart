package com.raeesmart.backend.Model;
import com.raeesmart.backend.Model.Enums.RolUsuario;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(length = 9)
    private String telefono;

    @Column(length = 8)
    private String dni;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RolUsuario rolUsuario;

    @Column(name = "fecha_registro", nullable = false, updatable = false)
    private LocalDateTime fechaRegistro;

    @Column(nullable = false, columnDefinition = "boolean default true")
    @Builder.Default
    private Boolean activo = true;

    @Column(name = "ultimo_acceso")
    private LocalDateTime ultimoAcceso;

    @Builder.Default
    @Column(name = "password_version", columnDefinition = "bigint default 0")
    private Long passwordVersion = 0L;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "municipalidad_id")
    private Municipalidad municipalidad;

    @Builder.Default
    private Boolean notificarPush = true;

    @Builder.Default
    private Boolean notificarCampanas = true;

    @Builder.Default
    private Boolean notificarEntregas = true;

    @Builder.Default
    private Boolean notificarRecordatorios = false;

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Entrega> entregas;

    @PrePersist
    public void prePersist() {
        if (this.fechaRegistro == null) {
            this.fechaRegistro = LocalDateTime.now();
        }
        if (this.rolUsuario == null) {
            this.rolUsuario = RolUsuario.CIUDADANO;
        }
        if (this.activo == null) {
            this.activo = true;
        }
        if (this.passwordVersion == null) {
            this.passwordVersion = 0L;
        }
    }
}
