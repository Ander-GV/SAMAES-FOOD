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

import com.restaurante.api.dto.ProductosRequestDTO;
import com.restaurante.api.dto.ProductosResponseDTO;
import com.restaurante.api.service.ProductosService;

@RestController
@RequestMapping("/api/v1/productos")
public class ProductosController {

    private final ProductosService productosService;

    public ProductosController(ProductosService productosService) {
        this.productosService = productosService;
    }

    @GetMapping
    public ResponseEntity<List<ProductosResponseDTO>> findAll() {
        return ResponseEntity.ok(productosService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductosResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(productosService.findById(id));
    }

    @PostMapping
    public ResponseEntity<ProductosResponseDTO> save(@Valid @RequestBody ProductosRequestDTO requestDTO) {
        return new ResponseEntity<>(productosService.save(requestDTO), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductosResponseDTO> update(@PathVariable Long id, @Valid @RequestBody ProductosRequestDTO requestDTO) {
        return ResponseEntity.ok(productosService.update(id, requestDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productosService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
