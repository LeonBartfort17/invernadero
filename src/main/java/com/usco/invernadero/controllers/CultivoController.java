package com.usco.invernadero.controllers;

import com.usco.invernadero.models.Cultivo;
import com.usco.invernadero.repositories.CultivoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cultivos")
public class CultivoController {

    @Autowired
    private CultivoRepository cultivoRepository;

    @GetMapping
    public List<Cultivo> listarCultivos() {
        return cultivoRepository.findAll();
    }

    @PostMapping
    public Cultivo crearCultivo(@RequestBody Cultivo cultivo) {
        return cultivoRepository.save(cultivo);
    }
}