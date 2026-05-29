package com.usco.invernadero.controllers;

import com.usco.invernadero.models.Usuario;
import com.usco.invernadero.models.enums.Rol;
import com.usco.invernadero.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AuthController {

    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    /**
     * GET /api/auth/me
     * Con JWT el email ya viene en el Authentication (puesto por JwtFilter).
     */
    @GetMapping("/me")
    public ResponseEntity<?> obtenerUsuarioActual(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "No hay sesión activa"));
        }

        String email = authentication.getName();

        return usuarioRepository.findByEmail(email)
                .map(u -> ResponseEntity.ok(Map.of(
                        "nombre", u.getNombre(),
                        "email",  u.getEmail(),
                        "rol",    u.getRol().name()
                )))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    /**
     * POST /api/auth/registro
     * Registra un nuevo usuario con rol VIEWER por defecto.
     */
    @PostMapping("/registro")
    public ResponseEntity<?> registrar(@RequestBody Map<String, String> datos) {
        String email    = datos.get("email");
        String password = datos.get("password");
        String nombre   = datos.get("nombre");

        if (email == null || password == null || nombre == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "nombre, email y password son requeridos"));
        }

        if (usuarioRepository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Ya existe un usuario con ese email"));
        }

        Usuario nuevo = new Usuario();
        nuevo.setNombre(nombre);
        nuevo.setEmail(email);
        nuevo.setPasswordHash(passwordEncoder.encode(password));
        nuevo.setRol(Rol.VIEWER);

        usuarioRepository.save(nuevo);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("mensaje", "Usuario registrado correctamente"));
    }

    /**
     * POST /api/auth/setup-admin  ← TEMPORAL, borrar después de usar
     */
    @PostMapping("/setup-admin")
    public ResponseEntity<?> setupAdmin(@RequestParam String email) {
        return usuarioRepository.findByEmail(email).map(u -> {
            u.setRol(Rol.ADMIN);
            usuarioRepository.save(u);
            return ResponseEntity.ok(Map.of("mensaje", "Rol actualizado a ADMIN para " + email));
        }).orElse(ResponseEntity.notFound().build());
    }
}