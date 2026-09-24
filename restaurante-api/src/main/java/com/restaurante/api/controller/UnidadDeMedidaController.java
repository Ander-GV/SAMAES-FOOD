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

import com.restaurante.api.dto.UnidadDeMedidaRequestDTO;
import com.restaurante.api.dto.UnidadDeMedidaResponseDTO;
import com.restaurante.api.service.UnidadDeMedidaService;

@RestController
@RequestMapping("/api/v1/unidades-medida")
public class UnidadDeMedidaController {

    private final UnidadDeMedidaService unidadDeMedidaService;

    public UnidadDeMedidaController(UnidadDeMedidaService unidadDeMedidaService) {
        this.unidadDeMedidaService = unidadDeMedidaService;
    }

    @GetMapping
    public ResponseEntity<List<UnidadDeMedidaResponseDTO>> findAll() {
        return ResponseEntity.ok(unidadDeMedidaService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UnidadDeMedidaResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(unidadDeMedidaService.findById(id));
    }

    @PostMapping
    public ResponseEntity<UnidadDeMedidaResponseDTO> save(@Valid @RequestBody UnidadDeMedidaRequestDTO requestDTO) {
        return new ResponseEntity<>(unidadDeMedidaService.save(requestDTO), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UnidadDeMedidaResponseDTO> update(@PathVariable Long id, @Valid @RequestBody UnidadDeMedidaRequestDTO requestDTO) {
        return ResponseEntity.ok(unidadDeMedidaService.update(id, requestDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        unidadDeMedidaService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
