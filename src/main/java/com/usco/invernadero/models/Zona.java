package com.usco.invernadero.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "zonas")
public class Zona {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    // Sincronizado exactamente con el JSON que envía y recibe React para evitar campos vacíos
    @Column(name = "tipo_cultivo")
    private String tipo_cultivo; 

    @Column(name = "area_total")
    private Double area_total; 

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    // Relación Muchos a Uno con Invernadero utilizando tipo UUID
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "invernadero_id", nullable = false) 
    private Invernadero invernadero;

    // Constructor vacío obligatorio para JPA/Hibernate
    public Zona() {}

    // Getters y Setters
    public Long getId() { 
        return id; 
    }
    public void setId(Long id) { 
        this.id = id; 
    }

    public String getNombre() { 
        return nombre; 
    }
    public void setNombre(String nombre) { 
        this.nombre = nombre; 
    }

    public String getTipo_cultivo() { 
        return tipo_cultivo; 
    }
    public void setTipo_cultivo(String tipo_cultivo) { 
        this.tipo_cultivo = tipo_cultivo; 
    }

    public Double getArea_total() { 
        return area_total; 
    }
    public void setArea_total(Double area_total) { 
        this.area_total = area_total; 
    }

    public LocalDateTime getCreatedAt() { 
        return createdAt; 
    }
    public void setCreatedAt(LocalDateTime createdAt) { 
        this.createdAt = createdAt; 
    }

    public Invernadero getInvernadero() { 
        return invernadero; 
    }
    public void setInvernadero(Invernadero invernadero) { 
        this.invernadero = invernadero; 
    }
}