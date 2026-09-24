package com.restaurante.api.controller;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.restaurante.api.dto.AuthRequestDTO;
import com.restaurante.api.dto.AuthResponseDTO;
import com.restaurante.api.service.AuthService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Autenticación", description = "Endpoints para inicio de sesión y obtención de tokens JWT")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    @Operation(summary = "Iniciar Sesión", description = "Autentica al usuario por su código de empleado y contraseña, retornando un token JWT.")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody AuthRequestDTO authRequestDTO) {
        AuthResponseDTO responseDTO = authService.login(authRequestDTO);
        return ResponseEntity.ok(responseDTO);
    }
}
