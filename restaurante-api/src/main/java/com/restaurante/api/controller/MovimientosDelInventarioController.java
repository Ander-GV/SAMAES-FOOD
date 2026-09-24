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

import com.restaurante.api.dto.MovimientosDelInventarioRequestDTO;
import com.restaurante.api.dto.MovimientosDelInventarioResponseDTO;
import com.restaurante.api.service.MovimientosDelInventarioService;

@RestController
@RequestMapping("/api/v1/movimientos-inventario")
public class MovimientosDelInventarioController {

    private final MovimientosDelInventarioService movimientosDelInventarioService;

    public MovimientosDelInventarioController(MovimientosDelInventarioService movimientosDelInventarioService) {
        this.movimientosDelInventarioService = movimientosDelInventarioService;
    }

    @GetMapping
    public ResponseEntity<List<MovimientosDelInventarioResponseDTO>> findAll() {
        return ResponseEntity.ok(movimientosDelInventarioService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MovimientosDelInventarioResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(movimientosDelInventarioService.findById(id));
    }

    @PostMapping
    public ResponseEntity<MovimientosDelInventarioResponseDTO> save(@Valid @RequestBody MovimientosDelInventarioRequestDTO requestDTO) {
        return new ResponseEntity<>(movimientosDelInventarioService.save(requestDTO), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MovimientosDelInventarioResponseDTO> update(@PathVariable Long id, @Valid @RequestBody MovimientosDelInventarioRequestDTO requestDTO) {
        return ResponseEntity.ok(movimientosDelInventarioService.update(id, requestDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        movimientosDelInventarioService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
