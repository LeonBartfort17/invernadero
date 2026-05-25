package com.usco.invernadero.controllers;

import com.usco.invernadero.models.Usuario;
import com.usco.invernadero.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para gestionar los usuarios.
 * Recibe y devuelve datos en formato JSON.
 * @version 1.0
 */
@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    /**
     * Obtiene la lista de todos los usuarios.
     * Método: GET
     */
    @GetMapping
    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    /**
     * Crea un nuevo usuario en la base de datos.
     * Método: POST
     */
    @PostMapping
    public Usuario crearUsuario(@RequestBody Usuario usuario) {
        return usuarioRepository.save(usuario);
    }
}
