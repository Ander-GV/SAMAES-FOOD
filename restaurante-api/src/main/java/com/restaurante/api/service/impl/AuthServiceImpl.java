package com.restaurante.api.service.impl;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.restaurante.api.dto.AuthRequestDTO;
import com.restaurante.api.dto.AuthResponseDTO;
import com.restaurante.api.entity.Usuarios;
import com.restaurante.api.exception.ResourceNotFoundException;
import com.restaurante.api.repository.UsuariosRepository;
import com.restaurante.api.security.JwtTokenProvider;
import com.restaurante.api.service.AuthService;

@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UsuariosRepository usuariosRepository;

    public AuthServiceImpl(AuthenticationManager authenticationManager,
                           JwtTokenProvider jwtTokenProvider,
                           UsuariosRepository usuariosRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.usuariosRepository = usuariosRepository;
    }

    @Override
    public AuthResponseDTO login(AuthRequestDTO authRequestDTO) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        authRequestDTO.getCodigoEmpleado(),
                        authRequestDTO.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = jwtTokenProvider.generateToken(authentication);

        Usuarios usuario = usuariosRepository.findByCodigoEmpleado(authRequestDTO.getCodigoEmpleado())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        String role = (usuario.getRoles() != null) ? usuario.getRoles().getNombre() : "USER";
        String nombreEmpleado = (usuario.getEmpleados() != null)
                ? usuario.getEmpleados().getNombre() + " " + usuario.getEmpleados().getApellido()
                : usuario.getCodigoEmpleado();

        return new AuthResponseDTO(token, usuario.getCodigoEmpleado(), role, nombreEmpleado);
    }
}
