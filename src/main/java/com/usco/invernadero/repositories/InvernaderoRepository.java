package com.usco.invernadero.repositories;

import com.usco.invernadero.models.Invernadero;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

/**
 * Repositorio para la entidad Invernadero.
 * @version 1.0
 */
@Repository
public interface InvernaderoRepository extends JpaRepository<Invernadero, UUID> {
}