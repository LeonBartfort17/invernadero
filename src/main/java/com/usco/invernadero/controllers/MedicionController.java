package com.usco.invernadero.controllers;

import com.usco.invernadero.models.Medicion;
import com.usco.invernadero.repositories.MedicionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mediciones")
public class MedicionController {

    @Autowired
    private MedicionRepository medicionRepository;

    @GetMapping
    public List<Medicion> listarMediciones() {
        return medicionRepository.findAll();
    }

    @PostMapping
    public Medicion registrarMedicion(@RequestBody Medicion medicion) {
        return medicionRepository.save(medicion);
    }
}