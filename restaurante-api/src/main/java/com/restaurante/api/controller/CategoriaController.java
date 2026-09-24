package com.restaurante.api.controller;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
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

import com.restaurante.api.dto.CategoriaRequestDTO;
import com.restaurante.api.dto.CategoriaResponseDTO;
import com.restaurante.api.service.CategoriaService;

@RestController
@RequestMapping("/api/v1/categorias")
public class CategoriaController {

    private final CategoriaService categoriaService;

    public CategoriaController(CategoriaService categoriaService) {
        this.categoriaService = categoriaService;
    }

    @GetMapping
    public ResponseEntity<List<CategoriaResponseDTO>> findAll() {
        return ResponseEntity.ok(categoriaService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoriaResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(categoriaService.findById(id));
    }

    @PostMapping
    public ResponseEntity<CategoriaResponseDTO> save(@Valid @RequestBody CategoriaRequestDTO requestDTO) {
        return new ResponseEntity<>(categoriaService.save(requestDTO), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoriaResponseDTO> update(@PathVariable Long id, @Valid @RequestBody CategoriaRequestDTO requestDTO) {
        return ResponseEntity.ok(categoriaService.update(id, requestDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        categoriaService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
