package com.usco.invernadero.controllers;

import com.usco.invernadero.models.Sensor;
import com.usco.invernadero.repositories.SensorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sensores")
public class SensorController {

    @Autowired
    private SensorRepository sensorRepository;

    @GetMapping
    public List<Sensor> listarSensores() {
        return sensorRepository.findAll();
    }

    @PostMapping
    public Sensor crearSensor(@RequestBody Sensor sensor) {
        return sensorRepository.save(sensor);
    }
}