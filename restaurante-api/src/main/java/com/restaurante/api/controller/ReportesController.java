package com.restaurante.api.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.restaurante.api.dto.InsumoAlertaResponseDTO;
import com.restaurante.api.dto.ProductoVendidoResponseDTO;
import com.restaurante.api.dto.ReporteCierreCajaResponseDTO;
import com.restaurante.api.dto.ReporteVentasResponseDTO;
import com.restaurante.api.service.ReportesService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/v1/reportes")
@Tag(name = "Reportes & Cierre de Caja", description = "Endpoints de análisis financiero, cuadre de caja por cajero, productos populares y alertas de stock (Exclusivo ADMINISTRADOR)")
public class ReportesController {

    private final ReportesService reportesService;

    public ReportesController(ReportesService reportesService) {
        this.reportesService = reportesService;
    }

    @GetMapping("/cierre-caja")
    @Operation(summary = "Cierre / Arqueo de Caja", description = "Calcula el dinero total recaudado en efectivo, tarjeta y transferencias por cajero o turno.")
    public ResponseEntity<ReporteCierreCajaResponseDTO> getCierreCaja(
            @RequestParam(required = false) Long usuarioId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return ResponseEntity.ok(reportesService.getCierreCaja(usuarioId, fecha));
    }

    @GetMapping("/ventas")
    @Operation(summary = "Reporte General de Ventas", description = "Obtiene ingresos totales, promedio por ticket y desglose porcentual por medio de pago en un rango de fechas.")
    public ResponseEntity<ReporteVentasResponseDTO> getReporteVentas(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaFin) {
        return ResponseEntity.ok(reportesService.getReporteVentas(fechaInicio, fechaFin));
    }

    @GetMapping({"/productos-mas-vendidos", "/top-productos"})
    @Operation(summary = "Ranking de Productos Más Vendidos", description = "Lista los platos y productos con mayor volumen de venta y recaudación.")
    public ResponseEntity<List<ProductoVendidoResponseDTO>> getProductosMasVendidos(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(reportesService.getProductosMasVendidos(limit));
    }


    @GetMapping("/alertas-inventario")
    @Operation(summary = "Alertas de Stock Bajo / Crítico", description = "Identifica los insumos que están por debajo del límite de seguridad clasificándolos en nivel CRITICO o BAJO.")
    public ResponseEntity<List<InsumoAlertaResponseDTO>> getAlertasInventario(
            @RequestParam(defaultValue = "10") Integer limiteStock) {
        return ResponseEntity.ok(reportesService.getAlertasInventario(limiteStock));
    }
}
