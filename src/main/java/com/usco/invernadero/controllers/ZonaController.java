package com.usco.invernadero.controllers;

import com.usco.invernadero.models.Invernadero;
import com.usco.invernadero.models.Zona;
import com.usco.invernadero.repositories.InvernaderoRepository;
import com.usco.invernadero.repositories.ZonaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

@RestController
@RequestMapping("/api/zonas")
@CrossOrigin(origins = "http://localhost:5173")
public class ZonaController {

    @Autowired private ZonaRepository zonaRepository;
    @Autowired private InvernaderoRepository invernaderoRepository;
    @Autowired private MessageSource messageSource; // ← inyectamos i18n

    // GET /api/zonas
    @GetMapping
    public List<Zona> obtenerTodas() {
        return zonaRepository.findAll();
    }

    // POST /api/zonas/{invernaderoId}
    @PostMapping("/{invernaderoId}")
    public ResponseEntity<String> guardarZona(
            @PathVariable UUID invernaderoId,
            @RequestBody Zona nuevaZona,
            Locale locale) { // ← Spring inyecta el locale del request automáticamente

        Invernadero invernadero = invernaderoRepository.findById(invernaderoId)
                .orElse(null);

        if (invernadero == null) {
            String msg = messageSource.getMessage(
                    "invernadero.no.encontrado", new Object[]{invernaderoId}, locale);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(msg);
        }

        nuevaZona.setInvernadero(invernadero);
        zonaRepository.save(nuevaZona);

        String msg = messageSource.getMessage("zona.creada", null, locale);
        return ResponseEntity.status(HttpStatus.CREATED).body(msg);
    }

    // DELETE /api/zonas/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<String> eliminarZona(
            @PathVariable Long id,
            Locale locale) {

        if (!zonaRepository.existsById(id)) {
            String msg = messageSource.getMessage(
                    "zona.no.encontrada", new Object[]{id}, locale);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(msg);
        }

        zonaRepository.deleteById(id);
        String msg = messageSource.getMessage("zona.eliminada", null, locale);
        return ResponseEntity.ok(msg);
    }
}
