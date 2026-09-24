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

import com.restaurante.api.dto.DetalleDelPedidoRequestDTO;
import com.restaurante.api.dto.DetalleDelPedidoResponseDTO;
import com.restaurante.api.service.DetalleDelPedidoService;

@RestController
@RequestMapping("/api/v1/detalles-pedidos")
public class DetalleDelPedidoController {

    private final DetalleDelPedidoService detalleDelPedidoService;

    public DetalleDelPedidoController(DetalleDelPedidoService detalleDelPedidoService) {
        this.detalleDelPedidoService = detalleDelPedidoService;
    }

    @GetMapping
    public ResponseEntity<List<DetalleDelPedidoResponseDTO>> findAll() {
        return ResponseEntity.ok(detalleDelPedidoService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DetalleDelPedidoResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(detalleDelPedidoService.findById(id));
    }

    @PostMapping
    public ResponseEntity<DetalleDelPedidoResponseDTO> save(@Valid @RequestBody DetalleDelPedidoRequestDTO requestDTO) {
        return new ResponseEntity<>(detalleDelPedidoService.save(requestDTO), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DetalleDelPedidoResponseDTO> update(@PathVariable Long id, @Valid @RequestBody DetalleDelPedidoRequestDTO requestDTO) {
        return ResponseEntity.ok(detalleDelPedidoService.update(id, requestDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        detalleDelPedidoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
