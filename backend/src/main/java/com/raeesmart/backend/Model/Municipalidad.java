package com.raeesmart.backend.Model;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Table(name = "municipalidad")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class Municipalidad {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(nullable = false, length = 100)
    private String distrito;

    @Column(length = 250)
    private String direccion;

    @Column(nullable = false)
    private Double latitud;

    @Column(nullable = false)
    private Double longitud;

    @Column(name = "contacto_email", length = 150)
    private String contactoEmail;

    @Column(nullable = false)
    private Boolean activo = false;

    @Column(name = "campanas_habilitadas", nullable = false)
    @Builder.Default
    private Boolean campanasHabilitadas = false;

    @OneToMany(mappedBy = "municipalidad", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PuntoRecoleccion> puntosRecoleccion;

}
