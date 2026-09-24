package com.restaurante.api.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.restaurante.api.dto.EstadoDelPedidoRequestDTO;
import com.restaurante.api.dto.PagosRequestDTO;
import com.restaurante.api.dto.PagosResponseDTO;
import com.restaurante.api.dto.PedidosRequestDTO;
import com.restaurante.api.dto.TipoDePedidosRequestDTO;
import com.restaurante.api.dto.UsuariosRequestDTO;
import com.restaurante.api.entity.Pagos;
import com.restaurante.api.entity.Pedidos;
import com.restaurante.api.entity.TipoDePago;
import com.restaurante.api.entity.Usuarios;
import com.restaurante.api.exception.BusinessException;
import com.restaurante.api.exception.ResourceNotFoundException;
import com.restaurante.api.mapper.PagosMapper;
import com.restaurante.api.repository.PagosRepository;
import com.restaurante.api.repository.PedidosRepository;
import com.restaurante.api.repository.TipoDePagoRepository;
import com.restaurante.api.repository.UsuariosRepository;
import com.restaurante.api.service.PagosService;
import com.restaurante.api.service.PedidosService;

@Service
@Transactional
public class PagosServiceImpl implements PagosService {

    private final PagosRepository pagosRepository;
    private final PagosMapper pagosMapper;
    private final PedidosRepository pedidosRepository;
    private final TipoDePagoRepository tipoDePagoRepository;
    private final UsuariosRepository usuariosRepository;
    private final PedidosService pedidosService;

    public PagosServiceImpl(
            PagosRepository pagosRepository,
            PagosMapper pagosMapper,
            PedidosRepository pedidosRepository,
            TipoDePagoRepository tipoDePagoRepository,
            UsuariosRepository usuariosRepository,
            @Lazy PedidosService pedidosService) {
        this.pagosRepository = pagosRepository;
        this.pagosMapper = pagosMapper;
        this.pedidosRepository = pedidosRepository;
        this.tipoDePagoRepository = tipoDePagoRepository;
        this.usuariosRepository = usuariosRepository;
        this.pedidosService = pedidosService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<PagosResponseDTO> findAll() {
        return pagosRepository.findAll().stream()
                .map(pagosMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PagosResponseDTO findById(Long id) {
        return pagosRepository.findById(id)
                .map(pagosMapper::toResponseDTO)
                .orElseThrow(() -> new ResourceNotFoundException("El pago solicitado no fue encontrado."));
    }

    @Override
    public PagosResponseDTO save(PagosRequestDTO requestDTO) {
        final Long pedidoId = (requestDTO.getPedidoId() != null) 
                ? requestDTO.getPedidoId() 
                : ((requestDTO.getPedido() != null) ? requestDTO.getPedido().getId() : null);

        if (pedidoId == null) {
            throw new BusinessException("El ID del pedido es obligatorio para procesar el pago.");
        }

        Pedidos pedido = pedidosRepository.findById(pedidoId)
                .orElseThrow(() -> new ResourceNotFoundException("El pedido con ID " + pedidoId + " no fue encontrado."));

        final Long tipoPagoId = (requestDTO.getTipoPagoId() != null) 
                ? requestDTO.getTipoPagoId() 
                : ((requestDTO.getTipoPago() != null) ? requestDTO.getTipoPago().getId() : null);

        if (tipoPagoId == null) {
            throw new BusinessException("El ID del tipo de pago es obligatorio.");
        }

        TipoDePago tipoPago = tipoDePagoRepository.findById(tipoPagoId)
                .orElseThrow(() -> new ResourceNotFoundException("El tipo de pago seleccionado no existe en el sistema."));

        final Long usuarioId = (requestDTO.getUsuarioId() != null) 
                ? requestDTO.getUsuarioId() 
                : ((requestDTO.getUsuario() != null) ? requestDTO.getUsuario().getId() : null);

        Usuarios usuarioObj = null;
        if (usuarioId != null) {
            usuarioObj = usuariosRepository.findById(usuarioId).orElse(null);
        }
        if (usuarioObj == null) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getName() != null) {
                final String username = auth.getName();
                usuarioObj = usuariosRepository.findByCodigoEmpleado(username).orElse(null);
            }
        }
        if (usuarioObj == null) {
            List<Usuarios> todosUsuarios = usuariosRepository.findAll();
            if (!todosUsuarios.isEmpty()) {
                usuarioObj = todosUsuarios.get(0);
            } else {
                throw new ResourceNotFoundException("No se encontró usuario para registrar la transacción.");
            }
        }

        // Calcular Pagos Anteriores acumulados para este Pedido
        List<Pagos> pagosExistentes = pagosRepository.findByPedidoId(pedidoId);
        BigDecimal totalPagadoAnterior = pagosExistentes.stream()
                .map(Pagos::getMonto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalPedido = pedido.getTotal() != null ? pedido.getTotal() : BigDecimal.ZERO;
        BigDecimal saldoActualPendiente = totalPedido.subtract(totalPagadoAnterior);

        if (saldoActualPendiente.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("El pedido #" + pedidoId + " ya ha sido pagado en su totalidad.");
        }

        // Determinar Monto a Cobrar en esta transacción
        BigDecimal montoACobrar = requestDTO.getMonto();
        if (montoACobrar == null || montoACobrar.compareTo(BigDecimal.ZERO) <= 0) {
            montoACobrar = saldoActualPendiente;
        }

        if (montoACobrar.compareTo(saldoActualPendiente) > 0) {
            throw new BusinessException("El monto a cobrar (" + montoACobrar + ") no puede ser mayor al saldo pendiente (" + saldoActualPendiente + ").");
        }

        // Validar cobro en Efectivo y calcular devuelta/cambio
        BigDecimal montoRecibido = requestDTO.getMontoRecibido();
        BigDecimal cambio = BigDecimal.ZERO;

        if (montoRecibido != null && montoRecibido.compareTo(BigDecimal.ZERO) > 0) {
            if (montoRecibido.compareTo(montoACobrar) < 0) {
                throw new BusinessException("El monto recibido en efectivo (" + montoRecibido + ") es menor al monto a cobrar (" + montoACobrar + ").");
            }
            cambio = montoRecibido.subtract(montoACobrar);
        } else {
            montoRecibido = montoACobrar;
        }

        Pagos entity = new Pagos();
        entity.setPedido(pedido);
        entity.setTipoPago(tipoPago);
        entity.setUsuario(usuarioObj);
        entity.setMonto(montoACobrar);
        entity.setFechaPago(requestDTO.getFechaPago() != null ? requestDTO.getFechaPago() : LocalDateTime.now());

        Pagos savedEntity = pagosRepository.save(entity);

        // Recalcular saldo pendiente tras registrar el pago actual
        BigDecimal totalPagadoNuevo = totalPagadoAnterior.add(montoACobrar);
        BigDecimal saldoPendienteNuevo = totalPedido.subtract(totalPagadoNuevo);
        if (saldoPendienteNuevo.compareTo(BigDecimal.ZERO) < 0) {
            saldoPendienteNuevo = BigDecimal.ZERO;
        }

        // Si el pedido se cubrió en su totalidad (saldoPendiente == 0), marcar como COMPLETADO (ID = 4)
        if (saldoPendienteNuevo.compareTo(BigDecimal.ZERO) == 0) {
            PedidosRequestDTO pedidoUpdateDTO = new PedidosRequestDTO();
            pedidoUpdateDTO.setId(pedido.getId());
            pedidoUpdateDTO.setFechaInicio(pedido.getFechaInicio());
            pedidoUpdateDTO.setFechafinalizacion(LocalDateTime.now());
            pedidoUpdateDTO.setSubtotal(pedido.getSubtotal());
            pedidoUpdateDTO.setTotal(pedido.getTotal());
            pedidoUpdateDTO.setDescuento(pedido.getDescuento());
            pedidoUpdateDTO.setDireccionEntrega(pedido.getDireccionEntrega());
            pedidoUpdateDTO.setNombreDestinatario(pedido.getNombreDestinatario());
            pedidoUpdateDTO.setTelefonoDestinatario(pedido.getTelefonoDestinatario());
            pedidoUpdateDTO.setEstadoPedido(new EstadoDelPedidoRequestDTO(4L, "Completado", "Pedido entregado y pagado"));

            if (pedido.getTipoPedido() != null) {
                pedidoUpdateDTO.setTipoPedido(new TipoDePedidosRequestDTO(pedido.getTipoPedido().getId(), pedido.getTipoPedido().getNombre(), pedido.getTipoPedido().getDescripcion()));
            }
            if (pedido.getUsuario() != null) {
                pedidoUpdateDTO.setUsuario(new UsuariosRequestDTO(pedido.getUsuario().getId(), pedido.getUsuario().getPassword(), pedido.getUsuario().getCodigoEmpleado(), null, null));
            }

            pedidosService.update(pedido.getId(), pedidoUpdateDTO);
        }

        PagosResponseDTO responseDTO = pagosMapper.toResponseDTO(savedEntity);
        responseDTO.setMontoRecibido(montoRecibido);
        responseDTO.setCambio(cambio);
        responseDTO.setTotalPedido(totalPedido);
        responseDTO.setTotalPagado(totalPagadoNuevo);
        responseDTO.setSaldoPendiente(saldoPendienteNuevo);

        return responseDTO;
    }

    @Override
    public PagosResponseDTO update(Long id, PagosRequestDTO requestDTO) {
        if (!pagosRepository.existsById(id)) {
            throw new ResourceNotFoundException("El pago que intenta actualizar no existe.");
        }
        Pagos entity = pagosMapper.toEntity(requestDTO);
        entity.setId(id);
        Pagos updatedEntity = pagosRepository.save(entity);
        return pagosMapper.toResponseDTO(updatedEntity);
    }

    @Override
    public void delete(Long id) {
        if (!pagosRepository.existsById(id)) {
            throw new ResourceNotFoundException("El pago que intenta eliminar no existe.");
        }
        pagosRepository.deleteById(id);
    }
}
