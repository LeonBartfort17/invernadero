package com.usco.invernadero.security;
 
import com.usco.invernadero.models.Usuario;
import com.usco.invernadero.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
 
import java.util.List;
 
/**
 * Servicio de autenticación con email y contraseña propia.
 */
@Service
public class UsuarioDetailsService implements UserDetailsService {
 
    @Autowired
    private UsuarioRepository usuarioRepository;
 
    @Autowired
    private PasswordEncoder passwordEncoder;
 
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        System.out.println("========================================");
        System.out.println("🔐 Login intento con email: [" + email + "]");
 
        // Buscar usuario ignorando espacios en blanco
        String emailLimpio = email != null ? email.trim() : "";
 
        Usuario usuario = usuarioRepository.findByEmail(emailLimpio)
                .orElseThrow(() -> {
                    System.out.println("❌ NO encontrado en BD: [" + emailLimpio + "]");
                    usuarioRepository.findAll().forEach(u ->
                        System.out.println("   BD tiene: [" + u.getEmail() + "]")
                    );
                    return new UsernameNotFoundException("Usuario no encontrado: " + emailLimpio);
                });
 
        System.out.println("✅ Encontrado: " + usuario.getEmail());
        System.out.println("🔑 Hash (10 chars): " + usuario.getPasswordHash().substring(0, 10));
        System.out.println("🔒 ¿Coincide 'admin123'? " + passwordEncoder.matches("admin123", usuario.getPasswordHash()));
        System.out.println("========================================");
 
        return User.builder()
                .username(usuario.getEmail())
                .password(usuario.getPasswordHash())
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_" + usuario.getRol().name())))
                .build();
    }
}