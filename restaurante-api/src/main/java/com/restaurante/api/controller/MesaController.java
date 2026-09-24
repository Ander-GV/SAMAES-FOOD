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

import com.restaurante.api.dto.MesaRequestDTO;
import com.restaurante.api.dto.MesaResponseDTO;
import com.restaurante.api.service.MesaService;

@RestController
@RequestMapping("/api/v1/mesas")
public class MesaController {

    private final MesaService mesaService;

    public MesaController(MesaService mesaService) {
        this.mesaService = mesaService;
    }

    @GetMapping
    public ResponseEntity<List<MesaResponseDTO>> findAll() {
        return ResponseEntity.ok(mesaService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MesaResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(mesaService.findById(id));
    }

    @PostMapping
    public ResponseEntity<MesaResponseDTO> save(@Valid @RequestBody MesaRequestDTO requestDTO) {
        return new ResponseEntity<>(mesaService.save(requestDTO), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MesaResponseDTO> update(@PathVariable Long id, @Valid @RequestBody MesaRequestDTO requestDTO) {
        return ResponseEntity.ok(mesaService.update(id, requestDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        mesaService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
