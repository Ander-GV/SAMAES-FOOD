package com.restaurante.api.controller;

import java.util.List;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.restaurante.api.dto.UsuariosRequestDTO;
import com.restaurante.api.dto.UsuariosResponseDTO;
import com.restaurante.api.service.UsuariosService;

@RestController
@RequestMapping("/api/v1/usuarios")
public class UsuariosController {

    private final UsuariosService usuariosService;

    public UsuariosController(UsuariosService usuariosService) {
        this.usuariosService = usuariosService;
    }

    @GetMapping
    public ResponseEntity<List<UsuariosResponseDTO>> findAll() {
        return ResponseEntity.ok(usuariosService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuariosResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(usuariosService.findById(id));
    }

    @PostMapping
    public ResponseEntity<UsuariosResponseDTO> save(@Valid @RequestBody UsuariosRequestDTO requestDTO) {
        return new ResponseEntity<>(usuariosService.save(requestDTO), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuariosResponseDTO> update(@PathVariable Long id,
            @Valid @RequestBody UsuariosRequestDTO requestDTO) {
        return ResponseEntity.ok(usuariosService.update(id, requestDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        usuariosService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
