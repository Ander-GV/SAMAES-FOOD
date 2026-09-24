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

import com.restaurante.api.dto.PedidosRequestDTO;
import com.restaurante.api.dto.PedidosResponseDTO;
import com.restaurante.api.service.PedidosService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/v1/pedidos")
@Tag(name = "Pedidos", description = "Endpoints para creación, gestión de comandas, promociones y cambio de estados de pedidos")
public class PedidosController {

    private final PedidosService pedidosService;

    public PedidosController(PedidosService pedidosService) {
        this.pedidosService = pedidosService;
    }

    @GetMapping
    @Operation(summary = "Listar Pedidos", description = "Obtiene la lista global de todos los pedidos registrados.")
    public ResponseEntity<List<PedidosResponseDTO>> findAll() {
        return ResponseEntity.ok(pedidosService.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener Pedido por ID", description = "Recupera un pedido específico con sus totales, estado y detalles asociados.")
    public ResponseEntity<PedidosResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(pedidosService.findById(id));
    }

    @PostMapping
    @Operation(summary = "Crear Pedido", description = "Registra un nuevo pedido en el sistema.")
    public ResponseEntity<PedidosResponseDTO> save(@Valid @RequestBody PedidosRequestDTO requestDTO) {
        return new ResponseEntity<>(pedidosService.save(requestDTO), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar Pedido", description = "Modifica los datos o el estado de un pedido.")
    public ResponseEntity<PedidosResponseDTO> update(@PathVariable Long id, @Valid @RequestBody PedidosRequestDTO requestDTO) {
        return ResponseEntity.ok(pedidosService.update(id, requestDTO));
    }

    @PutMapping("/{id}/estado")
    @Operation(summary = "Cambiar Estado del Pedido", description = "Actualiza directamente el estado de un pedido (ej. Cancelado, Completado, etc.).")
    public ResponseEntity<PedidosResponseDTO> cambiarEstado(
            @PathVariable Long id, 
            @org.springframework.web.bind.annotation.RequestParam Long nuevoEstadoId) {
        return ResponseEntity.ok(pedidosService.cambiarEstado(id, nuevoEstadoId));
    }


    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar Pedido", description = "Elimina un pedido del sistema.")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        pedidosService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
