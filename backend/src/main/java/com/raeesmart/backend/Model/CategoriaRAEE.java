package com.raeesmart.backend.Model;
import com.raeesmart.backend.Model.Enums.TipoRAEE;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "categorias_raee")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class CategoriaRAEE {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true, length = 40)
    private TipoRAEE tipo;

    @Column(name = "nombre_visible", nullable = false, length = 100)
    private String nombreVisible;

    @Column(length = 300)
    private String descripcion;

    @Column(name = "icono_url", length = 100)
    private String iconoUrl;
}
