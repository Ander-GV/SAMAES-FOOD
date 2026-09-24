package com.restaurante.api.service.impl;

import com.restaurante.api.dto.MovimientosDelInventarioRequestDTO;
import com.restaurante.api.dto.MovimientosDelInventarioResponseDTO;
import com.restaurante.api.entity.Ingredientes;
import com.restaurante.api.entity.MovimientosDelInventario;
import com.restaurante.api.entity.UnidadDeMedida;
import com.restaurante.api.exception.ResourceNotFoundException;
import com.restaurante.api.mapper.MovimientosDelInventarioMapper;
import com.restaurante.api.repository.IngredientesRepository;
import com.restaurante.api.repository.MovimientosDelInventarioRepository;
import com.restaurante.api.repository.TipoDeMovimientoRepository;
import com.restaurante.api.repository.UnidadDeMedidaRepository;
import com.restaurante.api.service.MovimientosDelInventarioService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class MovimientosDelInventarioServiceImpl implements MovimientosDelInventarioService {

    private final MovimientosDelInventarioRepository movimientosDelInventarioRepository;
    private final MovimientosDelInventarioMapper movimientosDelInventarioMapper;
    private final IngredientesRepository ingredientesRepository;
    private final UnidadDeMedidaRepository unidadDeMedidaRepository;
    private final TipoDeMovimientoRepository tipoDeMovimientoRepository;

    public MovimientosDelInventarioServiceImpl(
            MovimientosDelInventarioRepository movimientosDelInventarioRepository, 
            MovimientosDelInventarioMapper movimientosDelInventarioMapper,
            IngredientesRepository ingredientesRepository,
            UnidadDeMedidaRepository unidadDeMedidaRepository,
            TipoDeMovimientoRepository tipoDeMovimientoRepository) {
        this.movimientosDelInventarioRepository = movimientosDelInventarioRepository;
        this.movimientosDelInventarioMapper = movimientosDelInventarioMapper;
        this.ingredientesRepository = ingredientesRepository;
        this.unidadDeMedidaRepository = unidadDeMedidaRepository;
        this.tipoDeMovimientoRepository = tipoDeMovimientoRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<MovimientosDelInventarioResponseDTO> findAll() {
        return movimientosDelInventarioRepository.findAll().stream()
                .map(movimientosDelInventarioMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public MovimientosDelInventarioResponseDTO findById(Long id) {
        return movimientosDelInventarioRepository.findById(id)
                .map(movimientosDelInventarioMapper::toResponseDTO)
                .orElseThrow(() -> new ResourceNotFoundException("El movimiento de inventario solicitado no fue encontrado."));
    }

    @Override
    public MovimientosDelInventarioResponseDTO save(MovimientosDelInventarioRequestDTO requestDTO) {
        MovimientosDelInventario entity = movimientosDelInventarioMapper.toEntity(requestDTO);

        // 1. Obtener Factor de Conversión de la Unidad de Medida
        BigDecimal factor = BigDecimal.ONE;
        if (requestDTO.getUnidadDeMedida() != null && requestDTO.getUnidadDeMedida().getId() != null) {
            UnidadDeMedida unidad = unidadDeMedidaRepository.findById(requestDTO.getUnidadDeMedida().getId()).orElse(null);
            if (unidad != null && unidad.getFactorDeConversion() != null) {
                factor = unidad.getFactorDeConversion();
                entity.setUnidadDeMedida(unidad);
            }
        }

        // 2. Calcular cantidad de conversión en unidad base (ej. 2.5 Kg -> 2500 Gramos)
        BigDecimal cantidadOriginal = requestDTO.getCantidad() != null ? requestDTO.getCantidad() : BigDecimal.ZERO;
        BigDecimal cantidadDeConversion = cantidadOriginal.multiply(factor);
        entity.setCantidadDeConversion(cantidadDeConversion);

        // 3. Actualizar el Stock Real del Ingrediente en BD
        if (requestDTO.getIngrediente() != null && requestDTO.getIngrediente().getId() != null) {
            Ingredientes ingrediente = ingredientesRepository.findById(requestDTO.getIngrediente().getId()).orElse(null);
            if (ingrediente != null) {
                int stockActual = ingrediente.getStock() != null ? ingrediente.getStock() : 0;
                int cambioInsumo = cantidadDeConversion.intValue();

                boolean esEntrada = requestDTO.getTipoDeMovimiento() != null && 
                    (Long.valueOf(1L).equals(requestDTO.getTipoDeMovimiento().getId()) || 
                     "Entrada".equalsIgnoreCase(requestDTO.getTipoDeMovimiento().getNombre()));

                if (esEntrada) {
                    ingrediente.setStock(stockActual + cambioInsumo);
                } else {
                    ingrediente.setStock(stockActual - cambioInsumo);
                }

                ingredientesRepository.save(ingrediente);
                entity.setIngrediente(ingrediente);
            }
        }

        MovimientosDelInventario savedEntity = movimientosDelInventarioRepository.save(entity);
        return movimientosDelInventarioMapper.toResponseDTO(savedEntity);
    }

    @Override
    public MovimientosDelInventarioResponseDTO update(Long id, MovimientosDelInventarioRequestDTO requestDTO) {
        if (!movimientosDelInventarioRepository.existsById(id)) {
            throw new ResourceNotFoundException("El movimiento de inventario que intenta actualizar no existe.");
        }
        MovimientosDelInventario entity = movimientosDelInventarioMapper.toEntity(requestDTO);
        entity.setId(id);
        MovimientosDelInventario updatedEntity = movimientosDelInventarioRepository.save(entity);
        return movimientosDelInventarioMapper.toResponseDTO(updatedEntity);
    }

    @Override
    public void delete(Long id) {
        if (!movimientosDelInventarioRepository.existsById(id)) {
            throw new ResourceNotFoundException("El movimiento de inventario que intenta eliminar no existe.");
        }
        movimientosDelInventarioRepository.deleteById(id);
    }
}
