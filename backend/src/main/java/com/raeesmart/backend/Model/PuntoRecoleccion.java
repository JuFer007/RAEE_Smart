package com.raeesmart.backend.Model;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "puntos_recoleccion")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class PuntoRecoleccion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "municipalidad_id", nullable = false)
    private Municipalidad municipalidad;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(nullable = false)
    private Double latitud;

    @Column(nullable = false)
    private Double longitud;

    @Column(name = "horario_atencion", length = 100)
    private String horarioAtencion;

    @Column(name = "capacidad_diaria")
    private Integer capacidadDiaria;
}
