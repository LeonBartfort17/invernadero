package com.usco.invernadero.repositories;

import com.usco.invernadero.models.Medicion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface MedicionRepository extends JpaRepository<Medicion, UUID> {
}