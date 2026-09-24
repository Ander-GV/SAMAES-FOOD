package com.restaurante.api.controller;

import com.restaurante.api.dto.PromocionRequestDTO;
import com.restaurante.api.dto.PromocionResponseDTO;
import com.restaurante.api.service.PromocionService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/promociones")
public class PromocionController {

    private final PromocionService promocionService;

    public PromocionController(PromocionService promocionService) {
        this.promocionService = promocionService;
    }

    @GetMapping
    public ResponseEntity<List<PromocionResponseDTO>> findAll() {
        return ResponseEntity.ok(promocionService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PromocionResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(promocionService.findById(id));
    }

    @GetMapping("/cupon/{codigo}")
    public ResponseEntity<PromocionResponseDTO> findByCodigoCupon(@PathVariable String codigo) {
        return ResponseEntity.ok(promocionService.findByCodigoCupon(codigo));
    }

    @GetMapping("/elegible")
    public ResponseEntity<PromocionResponseDTO> obtenerPromocionElegible(@RequestParam BigDecimal subtotal) {
        PromocionResponseDTO response = promocionService.obtenerPromocionElegible(subtotal);
        if (response == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<PromocionResponseDTO> save(@Valid @RequestBody PromocionRequestDTO requestDTO) {
        return new ResponseEntity<>(promocionService.save(requestDTO), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PromocionResponseDTO> update(@PathVariable Long id, @Valid @RequestBody PromocionRequestDTO requestDTO) {
        return ResponseEntity.ok(promocionService.update(id, requestDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        promocionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
