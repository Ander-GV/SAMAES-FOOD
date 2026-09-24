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

import com.restaurante.api.dto.PagosRequestDTO;
import com.restaurante.api.dto.PagosResponseDTO;
import com.restaurante.api.service.PagosService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/v1/pagos")
@Tag(name = "Pagos & Cobros", description = "Endpoints para registro de pagos parciales/mixtos, devuelta en efectivo y facturación")
public class PagosController {

    private final PagosService pagosService;

    public PagosController(PagosService pagosService) {
        this.pagosService = pagosService;
    }

    @GetMapping
    @Operation(summary = "Listar Pagos", description = "Obtiene el historial completo de pagos procesados.")
    public ResponseEntity<List<PagosResponseDTO>> findAll() {
        return ResponseEntity.ok(pagosService.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener Pago por ID", description = "Busca un pago específico por su identificador.")
    public ResponseEntity<PagosResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(pagosService.findById(id));
    }

    @PostMapping
    @Operation(summary = "Registrar Pago", description = "Registra un pago parcial o total. Calcula devuelta en efectivo y cierra automáticamente el pedido al completar el saldo.")
    public ResponseEntity<PagosResponseDTO> save(@Valid @RequestBody PagosRequestDTO requestDTO) {
        return new ResponseEntity<>(pagosService.save(requestDTO), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar Pago", description = "Modifica un registro de pago existente.")
    public ResponseEntity<PagosResponseDTO> update(@PathVariable Long id, @Valid @RequestBody PagosRequestDTO requestDTO) {
        return ResponseEntity.ok(pagosService.update(id, requestDTO));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar Pago", description = "Elimina un registro de pago.")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        pagosService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
