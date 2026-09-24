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

import com.restaurante.api.dto.EmpleadosRequestDTO;
import com.restaurante.api.dto.EmpleadosResponseDTO;
import com.restaurante.api.service.EmpleadosService;

@RestController
@RequestMapping("/api/v1/empleados")
public class EmpleadosController {

    private final EmpleadosService empleadosService;

    public EmpleadosController(EmpleadosService empleadosService) {
        this.empleadosService = empleadosService;
    }

    @GetMapping
    public ResponseEntity<List<EmpleadosResponseDTO>> findAll() {
        return ResponseEntity.ok(empleadosService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmpleadosResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(empleadosService.findById(id));
    }

    @PostMapping
    public ResponseEntity<EmpleadosResponseDTO> save(@Valid @RequestBody EmpleadosRequestDTO requestDTO) {
        return new ResponseEntity<>(empleadosService.save(requestDTO), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmpleadosResponseDTO> update(@PathVariable Long id, @Valid @RequestBody EmpleadosRequestDTO requestDTO) {
        return ResponseEntity.ok(empleadosService.update(id, requestDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        empleadosService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
