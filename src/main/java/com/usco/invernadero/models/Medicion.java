package com.usco.invernadero.models;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;

/**
 * Entidad que representa una lectura o dato capturado por un sensor específico.
 */
@Data
@Entity
@Table(name = "mediciones")
public class Medicion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Relación: Esta medición pertenece a UN sensor específico
    @ManyToOne
    @JoinColumn(name = "sensor_id", nullable = false)
    private Sensor sensor;

    @Column(nullable = false)
    private Float valor; // Ej: 24.5, 65.2, etc.

    @CreationTimestamp
    @Column(name = "fecha_registro", updatable = false)
    private LocalDateTime fechaRegistro;
}