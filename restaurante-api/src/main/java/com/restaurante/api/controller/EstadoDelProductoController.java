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

import com.restaurante.api.dto.EstadoDelProductoRequestDTO;
import com.restaurante.api.dto.EstadoDelProductoResponseDTO;
import com.restaurante.api.service.EstadoDelProductoService;

@RestController
@RequestMapping("/api/v1/estados-productos")
public class EstadoDelProductoController {

    private final EstadoDelProductoService estadoDelProductoService;

    public EstadoDelProductoController(EstadoDelProductoService estadoDelProductoService) {
        this.estadoDelProductoService = estadoDelProductoService;
    }

    @GetMapping
    public ResponseEntity<List<EstadoDelProductoResponseDTO>> findAll() {
        return ResponseEntity.ok(estadoDelProductoService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EstadoDelProductoResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(estadoDelProductoService.findById(id));
    }

    @PostMapping
    public ResponseEntity<EstadoDelProductoResponseDTO> save(@Valid @RequestBody EstadoDelProductoRequestDTO requestDTO) {
        return new ResponseEntity<>(estadoDelProductoService.save(requestDTO), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EstadoDelProductoResponseDTO> update(@PathVariable Long id, @Valid @RequestBody EstadoDelProductoRequestDTO requestDTO) {
        return ResponseEntity.ok(estadoDelProductoService.update(id, requestDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        estadoDelProductoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
