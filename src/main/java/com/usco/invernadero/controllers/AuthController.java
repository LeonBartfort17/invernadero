package com.usco.invernadero.controllers;
 
import com.usco.invernadero.models.Usuario;
import com.usco.invernadero.models.enums.Rol;
import com.usco.invernadero.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
 
import java.util.Map;
 
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AuthController {
 
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private PasswordEncoder passwordEncoder;
 
    /**
     * GET /api/auth/me
     * Retorna el usuario autenticado actualmente en la sesión.
     * Funciona tanto para login con Google (OAuth2User)
     * como para login con email+password (UserDetails).
     */
    @GetMapping("/me")
    public ResponseEntity<?> obtenerUsuarioActual(Authentication authentication) {
 
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "No hay sesión activa"));
        }
 
        String email = null;
 
        // Caso 1: login con Google → el principal es OAuth2User
        if (authentication.getPrincipal() instanceof OAuth2User oauthUser) {
            email = oauthUser.getAttribute("email");
        }
        // Caso 2: login con email+password → el principal es UserDetails
        else if (authentication.getPrincipal() instanceof UserDetails userDetails) {
            email = userDetails.getUsername();
        }
 
        if (email == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "No se pudo obtener el email del usuario"));
        }
 
        final String emailFinal = email;
        return usuarioRepository.findByEmail(emailFinal)
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
}
 