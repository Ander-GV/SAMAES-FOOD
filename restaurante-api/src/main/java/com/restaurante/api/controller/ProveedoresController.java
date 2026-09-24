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

import com.restaurante.api.dto.ProveedoresRequestDTO;
import com.restaurante.api.dto.ProveedoresResponseDTO;
import com.restaurante.api.service.ProveedoresService;

@RestController
@RequestMapping("/api/v1/proveedores")
public class ProveedoresController {

    private final ProveedoresService proveedoresService;

    public ProveedoresController(ProveedoresService proveedoresService) {
        this.proveedoresService = proveedoresService;
    }

    @GetMapping
    public ResponseEntity<List<ProveedoresResponseDTO>> findAll() {
        return ResponseEntity.ok(proveedoresService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProveedoresResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(proveedoresService.findById(id));
    }

    @PostMapping
    public ResponseEntity<ProveedoresResponseDTO> save(@Valid @RequestBody ProveedoresRequestDTO requestDTO) {
        return new ResponseEntity<>(proveedoresService.save(requestDTO), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProveedoresResponseDTO> update(@PathVariable Long id, @Valid @RequestBody ProveedoresRequestDTO requestDTO) {
        return ResponseEntity.ok(proveedoresService.update(id, requestDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        proveedoresService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
