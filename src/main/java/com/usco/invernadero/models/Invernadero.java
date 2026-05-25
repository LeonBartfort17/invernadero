package com.usco.invernadero.models;

import jakarta.persistence.*;
import lombok.Data; 
import java.time.LocalDateTime;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;

// Nuevas importaciones necesarias para la lista de Zonas
import java.util.List;
import java.util.ArrayList;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.usco.invernadero.models.enums.TipoInvernadero;

/**
 * Entidad que representa la estructura física que contiene los cultivos.
 * @version 1.1
 */
@Data 
@Entity
@Table(name = "invernaderos")
public class Invernadero {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 200)
    private String ubicacion;

    @Column(name = "area_m2")
    private Float areaM2;

    @Enumerated(EnumType.STRING)
    private TipoInvernadero tipo;

    @Column(nullable = false)
    private Boolean activo = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // =================================================================
    // NUEVA RELACIÓN: Un Invernadero tiene muchas Zonas
    // =================================================================
    @JsonIgnore
    @OneToMany(mappedBy = "invernadero", cascade = CascadeType.ALL)
    private List<Zona> zonas = new ArrayList<>();
}