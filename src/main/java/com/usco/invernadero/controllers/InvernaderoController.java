package com.usco.invernadero.controllers;

import com.usco.invernadero.models.Invernadero;
import com.usco.invernadero.models.Usuario;
import com.usco.invernadero.repositories.InvernaderoRepository;
import com.usco.invernadero.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

/**
 * Controlador REST para gestionar los invernaderos.
 *
 * CORRECCIONES:
 * 1. @CrossOrigin eliminado; CORS se maneja globalmente en WebConfig.
 * 2. El POST ahora valida que el usuario exista antes de guardar.
 *    Antes: guardar sin usuario válido causaba violación NOT NULL en PostgreSQL.
 * 3. Nuevo endpoint GET por usuarioId para consultas más específicas.
 * 4. Respuesta HTTP 201 Created en POST (antes devolvía 200 OK por defecto).
 *
 * @version 1.1
 */
@RestController
@RequestMapping("/api/invernaderos")
public class InvernaderoController {

    @Autowired
    private InvernaderoRepository invernaderoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    /** GET /api/invernaderos - Lista todos los invernaderos. */
    @GetMapping
    public List<Invernadero> listarInvernaderos() {
        return invernaderoRepository.findAll();
    }

    /** GET /api/invernaderos/usuario/{usuarioId} - Invernaderos de un usuario. */
    @GetMapping("/usuario/{usuarioId}")
    public List<Invernadero> listarPorUsuario(@PathVariable UUID usuarioId) {
        // Verifica que el usuario exista antes de filtrar
        if (!usuarioRepository.existsById(usuarioId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Usuario con ID " + usuarioId + " no encontrado");
        }
        return invernaderoRepository.findAll().stream()
                .filter(i -> i.getUsuario() != null
                        && usuarioId.equals(i.getUsuario().getId()))
                .toList();
    }

    /**
     * POST /api/invernaderos/usuario/{usuarioId}
     * Crea un invernadero y lo asocia al usuario indicado.
     *
     * El usuario_id viene en la ruta para evitar inconsistencias y
     * garantizar que existe en la BD antes de intentar guardar.
     */
    @PostMapping("/usuario/{usuarioId}")
    public ResponseEntity<Invernadero> crearInvernadero(
            @PathVariable UUID usuarioId,
            @RequestBody Invernadero invernadero) {

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Usuario con ID " + usuarioId + " no encontrado"));

        invernadero.setUsuario(usuario);
        Invernadero guardado = invernaderoRepository.save(invernadero);
        return ResponseEntity.status(HttpStatus.CREATED).body(guardado);
    }
}
