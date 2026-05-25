package com.usco.invernadero.models;

import com.fasterxml.jackson.annotation.JsonIgnore; // Para evitar bucles infinitos en el JSON
import com.usco.invernadero.models.enums.TipoSensor;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;

/**
 * Entidad que representa un dispositivo sensor físico instalado dentro de una zona.
 * @version 1.1
 */
@Data
@Entity
@Table(name = "sensores")
public class Sensor {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /**
     * Relación Muchos a Uno: Varios sensores pueden estar en una sola zona.
     */
    @ManyToOne
    @JoinColumn(name = "zona_id", nullable = false)
    private Zona zona;

    @Column(nullable = false, length = 100)
    private String nombre; // Ej: Sensor DHT22 - Temperatura Norte

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoSensor tipo;

    @Column(nullable = false)
    private Boolean estadoActivo = true;

    /**
     * Relación Uno a Muchos: Un sensor genera muchas mediciones a lo largo del tiempo.
     * Usamos @JsonIgnore para que al consultar un sensor no se genere un bucle 
     * infinito con sus mediciones asignadas.
     */
    @JsonIgnore
    @OneToMany(mappedBy = "sensor", cascade = CascadeType.ALL)
    private List<Medicion> mediciones = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "fecha_registro", updatable = false)
    private LocalDateTime createdAt;
}