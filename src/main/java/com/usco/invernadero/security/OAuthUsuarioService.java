package com.usco.invernadero.security;

import com.usco.invernadero.models.Usuario;
import com.usco.invernadero.models.enums.Rol;
import com.usco.invernadero.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.*;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class OAuthUsuarioService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest request) throws OAuth2AuthenticationException {
        // 1. Obtener datos del perfil de Google
        DefaultOAuth2UserService delegate = new DefaultOAuth2UserService();
        OAuth2User oauthUser = delegate.loadUser(request);

        Map<String, Object> atributos = oauthUser.getAttributes();
        String email  = (String) atributos.get("email");
        String nombre = (String) atributos.get("name");

        // 2. Buscar o crear el usuario en la BD
        Usuario usuario = usuarioRepository.findByEmail(email).orElseGet(() -> {
            Usuario nuevo = new Usuario();
            nuevo.setNombre(nombre);
            nuevo.setEmail(email);
            nuevo.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
            nuevo.setRol(Rol.VIEWER);
            return usuarioRepository.save(nuevo);
        });

        // 3. ← CLAVE: devolver el OAuth2User con el rol real de la BD
        // Sin esto Spring Security no asigna ninguna autoridad y da 403
        String authority = "ROLE_" + usuario.getRol().name();
        return new DefaultOAuth2User(
                List.of(new SimpleGrantedAuthority(authority)),
                atributos,
                "email" // atributo que identifica al usuario
        );
    }
}
