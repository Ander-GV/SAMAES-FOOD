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

import com.restaurante.api.dto.IngredientesAndProductosRequestDTO;
import com.restaurante.api.dto.IngredientesAndProductosResponseDTO;
import com.restaurante.api.service.IngredientesAndProductosService;

@RestController
@RequestMapping("/api/v1/ingredientes-productos")
public class IngredientesAndProductosController {

    private final IngredientesAndProductosService ingredientesAndProductosService;

    public IngredientesAndProductosController(IngredientesAndProductosService ingredientesAndProductosService) {
        this.ingredientesAndProductosService = ingredientesAndProductosService;
    }

    @GetMapping
    public ResponseEntity<List<IngredientesAndProductosResponseDTO>> findAll() {
        return ResponseEntity.ok(ingredientesAndProductosService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<IngredientesAndProductosResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ingredientesAndProductosService.findById(id));
    }

    @PostMapping
    public ResponseEntity<IngredientesAndProductosResponseDTO> save(@Valid @RequestBody IngredientesAndProductosRequestDTO requestDTO) {
        return new ResponseEntity<>(ingredientesAndProductosService.save(requestDTO), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<IngredientesAndProductosResponseDTO> update(@PathVariable Long id, @Valid @RequestBody IngredientesAndProductosRequestDTO requestDTO) {
        return ResponseEntity.ok(ingredientesAndProductosService.update(id, requestDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        ingredientesAndProductosService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
