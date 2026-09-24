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

import com.restaurante.api.dto.TipoDeMovimientoRequestDTO;
import com.restaurante.api.dto.TipoDeMovimientoResponseDTO;
import com.restaurante.api.service.TipoDeMovimientoService;

@RestController
@RequestMapping("/api/v1/tipos-movimiento")
public class TipoDeMovimientoController {

    private final TipoDeMovimientoService tipoDeMovimientoService;

    public TipoDeMovimientoController(TipoDeMovimientoService tipoDeMovimientoService) {
        this.tipoDeMovimientoService = tipoDeMovimientoService;
    }

    @GetMapping
    public ResponseEntity<List<TipoDeMovimientoResponseDTO>> findAll() {
        return ResponseEntity.ok(tipoDeMovimientoService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TipoDeMovimientoResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(tipoDeMovimientoService.findById(id));
    }

    @PostMapping
    public ResponseEntity<TipoDeMovimientoResponseDTO> save(@Valid @RequestBody TipoDeMovimientoRequestDTO requestDTO) {
        return new ResponseEntity<>(tipoDeMovimientoService.save(requestDTO), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TipoDeMovimientoResponseDTO> update(@PathVariable Long id, @Valid @RequestBody TipoDeMovimientoRequestDTO requestDTO) {
        return ResponseEntity.ok(tipoDeMovimientoService.update(id, requestDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        tipoDeMovimientoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
