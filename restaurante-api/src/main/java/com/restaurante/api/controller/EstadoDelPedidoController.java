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

import com.restaurante.api.dto.EstadoDelPedidoRequestDTO;
import com.restaurante.api.dto.EstadoDelPedidoResponseDTO;
import com.restaurante.api.service.EstadoDelPedidoService;

@RestController
@RequestMapping("/api/v1/estados-pedidos")
public class EstadoDelPedidoController {

    private final EstadoDelPedidoService estadoDelPedidoService;

    public EstadoDelPedidoController(EstadoDelPedidoService estadoDelPedidoService) {
        this.estadoDelPedidoService = estadoDelPedidoService;
    }

    @GetMapping
    public ResponseEntity<List<EstadoDelPedidoResponseDTO>> findAll() {
        return ResponseEntity.ok(estadoDelPedidoService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EstadoDelPedidoResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(estadoDelPedidoService.findById(id));
    }

    @PostMapping
    public ResponseEntity<EstadoDelPedidoResponseDTO> save(@Valid @RequestBody EstadoDelPedidoRequestDTO requestDTO) {
        return new ResponseEntity<>(estadoDelPedidoService.save(requestDTO), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EstadoDelPedidoResponseDTO> update(@PathVariable Long id, @Valid @RequestBody EstadoDelPedidoRequestDTO requestDTO) {
        return ResponseEntity.ok(estadoDelPedidoService.update(id, requestDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        estadoDelPedidoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
