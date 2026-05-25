package com.usco.invernadero.repositories;

import com.usco.invernadero.models.Cultivo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface CultivoRepository extends JpaRepository<Cultivo, UUID> {
}