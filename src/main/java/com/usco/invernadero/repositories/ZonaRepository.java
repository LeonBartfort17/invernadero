package com.usco.invernadero.repositories;

import com.usco.invernadero.models.Zona;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repositorio para la entidad Zona.
 * CORRECCIÓN: El tipo de ID es Long (GenerationType.IDENTITY), no UUID.
 */
@Repository
public interface ZonaRepository extends JpaRepository<Zona, Long> {
}