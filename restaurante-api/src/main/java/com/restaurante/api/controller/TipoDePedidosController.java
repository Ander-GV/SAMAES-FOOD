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

import com.restaurante.api.dto.TipoDePedidosRequestDTO;
import com.restaurante.api.dto.TipoDePedidosResponseDTO;
import com.restaurante.api.service.TipoDePedidosService;

@RestController
@RequestMapping("/api/v1/tipos-pedidos")
public class TipoDePedidosController {

    private final TipoDePedidosService tipoDePedidosService;

    public TipoDePedidosController(TipoDePedidosService tipoDePedidosService) {
        this.tipoDePedidosService = tipoDePedidosService;
    }

    @GetMapping
    public ResponseEntity<List<TipoDePedidosResponseDTO>> findAll() {
        return ResponseEntity.ok(tipoDePedidosService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TipoDePedidosResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(tipoDePedidosService.findById(id));
    }

    @PostMapping
    public ResponseEntity<TipoDePedidosResponseDTO> save(@Valid @RequestBody TipoDePedidosRequestDTO requestDTO) {
        return new ResponseEntity<>(tipoDePedidosService.save(requestDTO), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TipoDePedidosResponseDTO> update(@PathVariable Long id, @Valid @RequestBody TipoDePedidosRequestDTO requestDTO) {
        return ResponseEntity.ok(tipoDePedidosService.update(id, requestDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        tipoDePedidosService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
