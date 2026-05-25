package com.usco.invernadero.repositories;

import com.usco.invernadero.models.Sensor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface SensorRepository extends JpaRepository<Sensor, UUID> {
}