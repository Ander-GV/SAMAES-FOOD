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

import com.restaurante.api.dto.IngredientesRequestDTO;
import com.restaurante.api.dto.IngredientesResponseDTO;
import com.restaurante.api.service.IngredientesService;

@RestController
@RequestMapping("/api/v1/ingredientes")
public class IngredientesController {

    private final IngredientesService ingredientesService;

    public IngredientesController(IngredientesService ingredientesService) {
        this.ingredientesService = ingredientesService;
    }

    @GetMapping
    public ResponseEntity<List<IngredientesResponseDTO>> findAll() {
        return ResponseEntity.ok(ingredientesService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<IngredientesResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ingredientesService.findById(id));
    }

    @PostMapping
    public ResponseEntity<IngredientesResponseDTO> save(@Valid @RequestBody IngredientesRequestDTO requestDTO) {
        return new ResponseEntity<>(ingredientesService.save(requestDTO), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<IngredientesResponseDTO> update(@PathVariable Long id, @Valid @RequestBody IngredientesRequestDTO requestDTO) {
        return ResponseEntity.ok(ingredientesService.update(id, requestDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        ingredientesService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
