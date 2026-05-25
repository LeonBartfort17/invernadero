package com.usco.invernadero.security;

import com.usco.invernadero.models.Usuario;
import com.usco.invernadero.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Le dice a Spring Security cómo cargar un usuario desde la BD
 * cuando alguien inicia sesión con email + contraseña.
 */
@Service
public class UsuarioDetailsService implements UserDetailsService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Usuario no encontrado con email: " + email));

        return User.builder()
                .username(usuario.getEmail())
                .password(usuario.getPasswordHash())
                // El rol se convierte a autoridad con prefijo ROLE_ (convención de Spring Security)
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_" + usuario.getRol().name())))
                .build();
    }
}
