package com.restaurante.api.security;

import java.util.Collections;
import java.util.List;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.restaurante.api.entity.Usuarios;
import com.restaurante.api.repository.UsuariosRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuariosRepository usuariosRepository;

    public CustomUserDetailsService(UsuariosRepository usuariosRepository) {
        this.usuariosRepository = usuariosRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String codigoEmpleado) throws UsernameNotFoundException {
        Usuarios usuario = usuariosRepository.findByCodigoEmpleado(codigoEmpleado)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con código de empleado: " + codigoEmpleado));

        String roleName = (usuario.getRoles() != null && usuario.getRoles().getNombre() != null)
                ? usuario.getRoles().getNombre()
                : "USER";

        if (!roleName.startsWith("ROLE_")) {
            roleName = "ROLE_" + roleName;
        }

        List<SimpleGrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority(roleName));

        return new User(
                usuario.getCodigoEmpleado(),
                usuario.getPassword(),
                authorities
        );
    }
}
