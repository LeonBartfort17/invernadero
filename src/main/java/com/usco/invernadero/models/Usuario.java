package com.usco.invernadero.models;

import com.usco.invernadero.models.enums.Rol;
import com.fasterxml.jackson.annotation.JsonIgnore; // Nuevo import
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;      // Nuevo import
import java.util.ArrayList; // Nuevo import

/**
 * Entidad que representa a un usuario dentro del sistema del invernadero.
 * @version 1.1
 */
@Data
@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, length = 150, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Rol rol;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    /**
     * Relación uno a muchos: Un usuario puede tener varios invernaderos.
     * 'mappedBy' indica que la relación la gobierna el campo 'usuario' en la clase Invernadero.
     */
    @JsonIgnore // Evita bucles infinitos en el JSON de Swagger
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL)
    private List<Invernadero> invernaderos = new ArrayList<>();
}