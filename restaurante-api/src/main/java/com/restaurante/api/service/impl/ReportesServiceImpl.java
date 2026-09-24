package com.restaurante.api.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.restaurante.api.dto.GastoResponseDTO;
import com.restaurante.api.dto.InsumoAlertaResponseDTO;
import com.restaurante.api.dto.ProductoVendidoResponseDTO;
import com.restaurante.api.dto.ReporteCierreCajaResponseDTO;
import com.restaurante.api.dto.ReporteVentasResponseDTO;
import com.restaurante.api.dto.VentasPorTipoPagoDTO;
import com.restaurante.api.entity.DetalleDelPedido;
import com.restaurante.api.entity.Gasto;
import com.restaurante.api.entity.Ingredientes;
import com.restaurante.api.entity.Pagos;
import com.restaurante.api.entity.Usuarios;
import com.restaurante.api.exception.ResourceNotFoundException;
import com.restaurante.api.mapper.GastoMapper;
import com.restaurante.api.repository.DetalleDelPedidoRepository;
import com.restaurante.api.repository.GastoRepository;
import com.restaurante.api.repository.IngredientesRepository;
import com.restaurante.api.repository.PagosRepository;
import com.restaurante.api.repository.UsuariosRepository;
import com.restaurante.api.service.ReportesService;

@Service
@Transactional(readOnly = true)
public class ReportesServiceImpl implements ReportesService {

    private final PagosRepository pagosRepository;
    private final DetalleDelPedidoRepository detalleDelPedidoRepository;
    private final IngredientesRepository ingredientesRepository;
    private final UsuariosRepository usuariosRepository;
    private final GastoRepository gastoRepository;
    private final GastoMapper gastoMapper;

    public ReportesServiceImpl(
            PagosRepository pagosRepository,
            DetalleDelPedidoRepository detalleDelPedidoRepository,
            IngredientesRepository ingredientesRepository,
            UsuariosRepository usuariosRepository,
            GastoRepository gastoRepository,
            GastoMapper gastoMapper) {
        this.pagosRepository = pagosRepository;
        this.detalleDelPedidoRepository = detalleDelPedidoRepository;
        this.ingredientesRepository = ingredientesRepository;
        this.usuariosRepository = usuariosRepository;
        this.gastoRepository = gastoRepository;
        this.gastoMapper = gastoMapper;
    }

    @Override
    public ReporteCierreCajaResponseDTO getCierreCaja(Long usuarioId, LocalDate fecha) {
        Long targetUsuarioId = usuarioId;
        if (targetUsuarioId == null) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getName() != null) {
                Usuarios user = usuariosRepository.findByCodigoEmpleado(auth.getName()).orElse(null);
                if (user != null) {
                    targetUsuarioId = user.getId();
                }
            }
        }

        if (targetUsuarioId == null) {
            Usuarios primerUsuario = usuariosRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("No se encontró usuario para consultar el cierre de caja."));
            targetUsuarioId = primerUsuario.getId();
        }

        final Long finalUsuarioId = targetUsuarioId;
        Usuarios usuarioObj = usuariosRepository.findById(finalUsuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("El usuario especificado no existe."));

        LocalDate targetFecha = (fecha != null) ? fecha : LocalDate.now();
        LocalDateTime inicio = targetFecha.atStartOfDay();
        LocalDateTime fin = targetFecha.atTime(LocalTime.MAX);

        List<Pagos> pagosDelDia = pagosRepository.findByUsuarioIdAndFechaPagoBetween(finalUsuarioId, inicio, fin);

        BigDecimal totalRecaudado = BigDecimal.ZERO;
        BigDecimal totalEfectivo = BigDecimal.ZERO;
        BigDecimal totalTarjeta = BigDecimal.ZERO;
        BigDecimal totalTransferencia = BigDecimal.ZERO;

        for (Pagos pago : pagosDelDia) {
            BigDecimal monto = pago.getMonto() != null ? pago.getMonto() : BigDecimal.ZERO;
            totalRecaudado = totalRecaudado.add(monto);

            String tipoNombre = (pago.getTipoPago() != null && pago.getTipoPago().getNombre() != null)
                    ? pago.getTipoPago().getNombre().toLowerCase()
                    : "";

            if (tipoNombre.contains("efectivo")) {
                totalEfectivo = totalEfectivo.add(monto);
            } else if (tipoNombre.contains("tarjeta")) {
                totalTarjeta = totalTarjeta.add(monto);
            } else {
                totalTransferencia = totalTransferencia.add(monto);
            }
        }

        // Consultar Gastos y Pagos a Empleados del día
        List<Gasto> gastosDelDia = gastoRepository.findByFechaBetweenOrderByFechaDesc(inicio, fin);
        BigDecimal totalEgresos = BigDecimal.ZERO;
        BigDecimal totalPagosEmpleados = BigDecimal.ZERO;
        BigDecimal totalGastosOperativos = BigDecimal.ZERO;
        List<GastoResponseDTO> gastosDTOList = new ArrayList<>();

        for (Gasto g : gastosDelDia) {
            BigDecimal gMonto = (g.getMonto() != null) ? g.getMonto() : BigDecimal.ZERO;
            totalEgresos = totalEgresos.add(gMonto);

            if ("PAGO_EMPLEADO".equalsIgnoreCase(g.getCategoria())) {
                totalPagosEmpleados = totalPagosEmpleados.add(gMonto);
            } else {
                totalGastosOperativos = totalGastosOperativos.add(gMonto);
            }
            gastosDTOList.add(gastoMapper.toResponseDTO(g));
        }

        // Saldo Neto en Efectivo = Efectivo recibido - Gastos/Pagos en efectivo
        BigDecimal saldoNetoEfectivo = totalEfectivo.subtract(totalEgresos);

        long cantidadPedidos = pagosDelDia.stream()
                .filter(p -> p.getPedido() != null)
                .map(p -> p.getPedido().getId())
                .distinct()
                .count();

        String nombreCompleto = (usuarioObj.getEmpleados() != null)
                ? (usuarioObj.getEmpleados().getNombre() + " " + usuarioObj.getEmpleados().getApellido()).trim()
                : usuarioObj.getCodigoEmpleado();

        ReporteCierreCajaResponseDTO dto = new ReporteCierreCajaResponseDTO();
        dto.setUsuarioId(usuarioObj.getId());
        dto.setNombreUsuario(nombreCompleto);
        dto.setCodigoEmpleado(usuarioObj.getCodigoEmpleado());
        dto.setFechaConsulta(LocalDateTime.now());
        dto.setTotalRecaudado(totalRecaudado);
        dto.setTotalEfectivo(totalEfectivo);
        dto.setTotalTarjeta(totalTarjeta);
        dto.setTotalTransferencia(totalTransferencia);
        dto.setTotalEgresos(totalEgresos);
        dto.setTotalPagosEmpleados(totalPagosEmpleados);
        dto.setTotalGastosOperativos(totalGastosOperativos);
        dto.setSaldoNetoEfectivo(saldoNetoEfectivo);
        dto.setGastos(gastosDTOList);
        dto.setCantidadTransacciones((long) pagosDelDia.size());
        dto.setCantidadPedidosCompletados(cantidadPedidos);

        return dto;
    }

    @Override
    public ReporteVentasResponseDTO getReporteVentas(LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        LocalDateTime inicio = (fechaInicio != null) ? fechaInicio : LocalDateTime.of(2000, 1, 1, 0, 0);
        LocalDateTime fin = (fechaFin != null) ? fechaFin : LocalDateTime.of(2099, 12, 31, 23, 59);

        List<Pagos> pagos = pagosRepository.findByFechaPagoBetween(inicio, fin);

        BigDecimal totalVentas = BigDecimal.ZERO;
        List<VentasPorTipoPagoDTO> descomposicion = new ArrayList<>();

        if (pagos.isEmpty()) {
            return new ReporteVentasResponseDTO(BigDecimal.ZERO, 0L, BigDecimal.ZERO, descomposicion);
        }

        for (Pagos pago : pagos) {
            BigDecimal monto = (pago.getMonto() != null) ? pago.getMonto() : BigDecimal.ZERO;
            totalVentas = totalVentas.add(monto);
        }

        long cantidadPedidos = pagos.stream()
                .filter(p -> p.getPedido() != null)
                .map(p -> p.getPedido().getId())
                .distinct()
                .count();

        BigDecimal promedioTicket = (cantidadPedidos > 0)
                ? totalVentas.divide(BigDecimal.valueOf(cantidadPedidos), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // Agrupar por Método de Pago
        Map<String, BigDecimal> ventasPorTipo = pagos.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        p -> (p.getTipoPago() != null && p.getTipoPago().getNombre() != null) ? p.getTipoPago().getNombre() : "Otro",
                        java.util.stream.Collectors.reducing(BigDecimal.ZERO, p -> p.getMonto() != null ? p.getMonto() : BigDecimal.ZERO, BigDecimal::add)
                ));

        for (Map.Entry<String, BigDecimal> entry : ventasPorTipo.entrySet()) {
            double porcentaje = 0.0;
            if (totalVentas.compareTo(BigDecimal.ZERO) > 0) {
                porcentaje = entry.getValue().multiply(BigDecimal.valueOf(100))
                        .divide(totalVentas, 2, RoundingMode.HALF_UP).doubleValue();
            }
            descomposicion.add(new VentasPorTipoPagoDTO(entry.getKey(), entry.getValue(), porcentaje));
        }

        return new ReporteVentasResponseDTO(totalVentas, cantidadPedidos, promedioTicket, descomposicion);
    }

    @Override
    public List<ProductoVendidoResponseDTO> getProductosMasVendidos(int limit) {
        int maxResults = (limit > 0) ? limit : 10;
        List<DetalleDelPedido> detalles = detalleDelPedidoRepository.findAll();

        Map<Long, ProductoVendidoResponseDTO> mapa = new java.util.HashMap<>();

        for (DetalleDelPedido d : detalles) {
            if (d.getProducto() != null && d.getProducto().getId() != null) {
                Long pId = d.getProducto().getId();
                String nombre = d.getProducto().getNombre();
                long cantidad = d.getCantidad();
                BigDecimal total = d.getPrecioTotal() != null ? d.getPrecioTotal() : BigDecimal.ZERO;

                mapa.compute(pId, (id, dto) -> {
                    if (dto == null) {
                        return new ProductoVendidoResponseDTO(pId, nombre, cantidad, total);
                    } else {
                        dto.setCantidadVendida(dto.getCantidadVendida() + cantidad);
                        dto.setTotalRecaudado(dto.getTotalRecaudado().add(total));
                        return dto;
                    }
                });
            }
        }

        return mapa.values().stream()
                .sorted(Comparator.comparingLong(ProductoVendidoResponseDTO::getCantidadVendida).reversed())
                .limit(maxResults)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public List<InsumoAlertaResponseDTO> getAlertasInventario(Integer limiteStock) {
        int limite = (limiteStock != null && limiteStock > 0) ? limiteStock : 10;
        List<Ingredientes> insumosBajos = ingredientesRepository.findByStockLessThanEqualOrderByStockAsc(limite);

        List<InsumoAlertaResponseDTO> lista = new ArrayList<>();
        for (Ingredientes i : insumosBajos) {
            String unidad = (i.getUnidadDeMedida() != null) ? i.getUnidadDeMedida().getNombre() : "Unidad";
            String nivel = (i.getStock() <= 3) ? "CRITICO" : "BAJO";
            lista.add(new InsumoAlertaResponseDTO(i.getId(), i.getNombre(), i.getStock(), unidad, nivel));
        }

        return lista;
    }
}
