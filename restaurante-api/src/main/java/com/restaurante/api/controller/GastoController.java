package com.restaurante.api.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
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

import com.restaurante.api.dto.GastoRequestDTO;
import com.restaurante.api.dto.GastoResponseDTO;
import com.restaurante.api.service.GastoService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/v1/gastos")
@Tag(name = "Gastos & Egresos Diarios", description = "Endpoints para registro de pagos de turno a empleados, compras menores y egresos de caja")
public class GastoController {

    private final GastoService gastoService;

    public GastoController(GastoService gastoService) {
        this.gastoService = gastoService;
    }

    @GetMapping
    @Operation(summary = "Listar todos los gastos", description = "Recupera todos los registros de egresos y pagos de empleados.")
    public ResponseEntity<List<GastoResponseDTO>> findAll() {
        return ResponseEntity.ok(gastoService.findAll());
    }

    @GetMapping("/fecha")
    @Operation(summary = "Filtrar gastos por fecha", description = "Obtiene los egresos registrados en una fecha o rango de fechas específico.")
    public ResponseEntity<List<GastoResponseDTO>> findByFecha(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin) {

        if (inicio != null && fin != null) {
            return ResponseEntity.ok(gastoService.findByRangoFecha(inicio, fin));
        }

        LocalDate targetFecha = (fecha != null) ? fecha : LocalDate.now();
        LocalDateTime inicioDia = targetFecha.atStartOfDay();
        LocalDateTime finDia = targetFecha.atTime(LocalTime.MAX);
        return ResponseEntity.ok(gastoService.findByRangoFecha(inicioDia, finDia));
    }

    @GetMapping("/empleado/{empleadoId}")
    @Operation(summary = "Listar pagos a un empleado", description = "Obtiene el historial de pagos de jornal/turno a un empleado.")
    public ResponseEntity<List<GastoResponseDTO>> findByEmpleado(@PathVariable Long empleadoId) {
        return ResponseEntity.ok(gastoService.findByEmpleadoId(empleadoId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener gasto por ID", description = "Recupera un egreso específico por su identificador.")
    public ResponseEntity<GastoResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(gastoService.findById(id));
    }

    @PostMapping
    @Operation(summary = "Registrar nuevo gasto / Pago de empleado", description = "Crea un nuevo egreso de caja diario.")
    public ResponseEntity<GastoResponseDTO> save(@Valid @RequestBody GastoRequestDTO requestDTO) {
        return new ResponseEntity<>(gastoService.save(requestDTO), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar gasto", description = "Modifica los datos de un gasto registrado.")
    public ResponseEntity<GastoResponseDTO> update(@PathVariable Long id, @Valid @RequestBody GastoRequestDTO requestDTO) {
        return ResponseEntity.ok(gastoService.update(id, requestDTO));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar gasto", description = "Elimina un registro de egreso.")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        gastoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
