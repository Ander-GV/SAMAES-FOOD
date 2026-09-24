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

import com.restaurante.api.dto.RolesRequestDTO;
import com.restaurante.api.dto.RolesResponseDTO;
import com.restaurante.api.service.RolesService;

@RestController
@RequestMapping("/api/v1/roles")
public class RolesController {

    private final RolesService rolesService;

    public RolesController(RolesService rolesService) {
        this.rolesService = rolesService;
    }

    @GetMapping
    public ResponseEntity<List<RolesResponseDTO>> findAll() {
        return ResponseEntity.ok(rolesService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RolesResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(rolesService.findById(id));
    }

    @PostMapping
    public ResponseEntity<RolesResponseDTO> save(@Valid @RequestBody RolesRequestDTO requestDTO) {
        return new ResponseEntity<>(rolesService.save(requestDTO), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RolesResponseDTO> update(@PathVariable Long id, @Valid @RequestBody RolesRequestDTO requestDTO) {
        return ResponseEntity.ok(rolesService.update(id, requestDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        rolesService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
