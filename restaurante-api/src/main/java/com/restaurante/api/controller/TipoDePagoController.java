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

import com.restaurante.api.dto.TipoDePagoRequestDTO;
import com.restaurante.api.dto.TipoDePagoResponseDTO;
import com.restaurante.api.service.TipoDePagoService;

@RestController
@RequestMapping("/api/v1/tipos-pago")
public class TipoDePagoController {

    private final TipoDePagoService tipoDePagoService;

    public TipoDePagoController(TipoDePagoService tipoDePagoService) {
        this.tipoDePagoService = tipoDePagoService;
    }

    @GetMapping
    public ResponseEntity<List<TipoDePagoResponseDTO>> findAll() {
        return ResponseEntity.ok(tipoDePagoService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TipoDePagoResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(tipoDePagoService.findById(id));
    }

    @PostMapping
    public ResponseEntity<TipoDePagoResponseDTO> save(@Valid @RequestBody TipoDePagoRequestDTO requestDTO) {
        return new ResponseEntity<>(tipoDePagoService.save(requestDTO), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TipoDePagoResponseDTO> update(@PathVariable Long id, @Valid @RequestBody TipoDePagoRequestDTO requestDTO) {
        return ResponseEntity.ok(tipoDePagoService.update(id, requestDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        tipoDePagoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
