package com.usco.invernadero.models;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;

/**
 * Entidad que representa las plantas sembradas en una zona.
 */
@Data
@Entity
@Table(name = "cultivos")
public class Cultivo {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Relación: Este cultivo pertenece a UNA zona
    @ManyToOne
    @JoinColumn(name = "zona_id", nullable = false)
    private Zona zona;

    @Column(nullable = false, length = 100)
    private String tipoPlanta; // Ej: Tomate, Lechuga, Zanahoria

    @Column(name = "fecha_siembra", nullable = false)
    private LocalDate fechaSiembra;

    @Column(name = "fecha_cosecha_estimada")
    private LocalDate fechaCosechaEstimada;

    @Column(nullable = false)
    private Boolean estadoActivo = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}