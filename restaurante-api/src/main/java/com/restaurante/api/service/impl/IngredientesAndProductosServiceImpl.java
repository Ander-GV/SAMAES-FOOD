package com.restaurante.api.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.restaurante.api.dto.IngredientesAndProductosRequestDTO;
import com.restaurante.api.dto.IngredientesAndProductosResponseDTO;
import com.restaurante.api.entity.Ingredientes;
import com.restaurante.api.entity.IngredientesAndProductos;
import com.restaurante.api.entity.Productos;
import com.restaurante.api.exception.ResourceNotFoundException;
import com.restaurante.api.mapper.IngredientesAndProductosMapper;
import com.restaurante.api.repository.IngredientesAndProductosRepository;
import com.restaurante.api.repository.IngredientesRepository;
import com.restaurante.api.repository.ProductosRepository;
import com.restaurante.api.service.IngredientesAndProductosService;

@Service
@Transactional
public class IngredientesAndProductosServiceImpl implements IngredientesAndProductosService {

    private final IngredientesAndProductosRepository ingredientesAndProductosRepository;
    private final IngredientesAndProductosMapper ingredientesAndProductosMapper;
    private final IngredientesRepository ingredientesRepository;
    private final ProductosRepository productosRepository;

    public IngredientesAndProductosServiceImpl(
            IngredientesAndProductosRepository ingredientesAndProductosRepository,
            IngredientesAndProductosMapper ingredientesAndProductosMapper,
            IngredientesRepository ingredientesRepository,
            ProductosRepository productosRepository) {
        this.ingredientesAndProductosRepository = ingredientesAndProductosRepository;
        this.ingredientesAndProductosMapper = ingredientesAndProductosMapper;
        this.ingredientesRepository = ingredientesRepository;
        this.productosRepository = productosRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<IngredientesAndProductosResponseDTO> findAll() {
        return ingredientesAndProductosRepository.findAll().stream()
                .map(ingredientesAndProductosMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<IngredientesAndProductosResponseDTO> findByProductosId(Long productoId) {
        return ingredientesAndProductosRepository.findByProductosId(productoId).stream()
                .map(ingredientesAndProductosMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public IngredientesAndProductosResponseDTO findById(Long id) {
        return ingredientesAndProductosRepository.findById(id)
                .map(ingredientesAndProductosMapper::toResponseDTO)
                .orElseThrow(() -> new ResourceNotFoundException("La relación entre ingrediente y producto solicitada no fue encontrada."));
    }

    @Override
    public IngredientesAndProductosResponseDTO save(IngredientesAndProductosRequestDTO requestDTO) {
        IngredientesAndProductos entity = ingredientesAndProductosMapper.toEntity(requestDTO);
        cargarEntidadesRelacionadas(entity, requestDTO);
        IngredientesAndProductos savedEntity = ingredientesAndProductosRepository.save(entity);
        return ingredientesAndProductosMapper.toResponseDTO(savedEntity);
    }

    @Override
    public IngredientesAndProductosResponseDTO update(Long id, IngredientesAndProductosRequestDTO requestDTO) {
        if (!ingredientesAndProductosRepository.existsById(id)) {
            throw new ResourceNotFoundException("La relación entre ingrediente y producto que intenta actualizar no existe.");
        }
        IngredientesAndProductos entity = ingredientesAndProductosMapper.toEntity(requestDTO);
        entity.setId(id);
        cargarEntidadesRelacionadas(entity, requestDTO);
        IngredientesAndProductos updatedEntity = ingredientesAndProductosRepository.save(entity);
        return ingredientesAndProductosMapper.toResponseDTO(updatedEntity);
    }

    @Override
    public void delete(Long id) {
        if (!ingredientesAndProductosRepository.existsById(id)) {
            throw new ResourceNotFoundException("La relación entre ingrediente y producto que intenta eliminar no existe.");
        }
        ingredientesAndProductosRepository.deleteById(id);
    }

    private void cargarEntidadesRelacionadas(IngredientesAndProductos entity, IngredientesAndProductosRequestDTO requestDTO) {
        if (requestDTO.getIngredientes() != null && requestDTO.getIngredientes().getId() != null) {
            Ingredientes ingrediente = ingredientesRepository.findById(requestDTO.getIngredientes().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("El ingrediente asociado no fue encontrado."));
            entity.setIngredientes(ingrediente);
        }
        if (requestDTO.getProductos() != null && requestDTO.getProductos().getId() != null) {
            Productos producto = productosRepository.findById(requestDTO.getProductos().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("El producto asociado no fue encontrado."));
            entity.setProductos(producto);
        }
    }
}
