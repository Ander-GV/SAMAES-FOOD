package com.restaurante.api.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.restaurante.api.dto.InsumoAlertaResponseDTO;
import com.restaurante.api.dto.ProductoVendidoResponseDTO;
import com.restaurante.api.dto.ReporteCierreCajaResponseDTO;
import com.restaurante.api.dto.ReporteVentasResponseDTO;

public interface ReportesService {

    ReporteCierreCajaResponseDTO getCierreCaja(Long usuarioId, LocalDate fecha);

    ReporteVentasResponseDTO getReporteVentas(LocalDateTime fechaInicio, LocalDateTime fechaFin);

    List<ProductoVendidoResponseDTO> getProductosMasVendidos(int limit);

    List<InsumoAlertaResponseDTO> getAlertasInventario(Integer limiteStock);
}
