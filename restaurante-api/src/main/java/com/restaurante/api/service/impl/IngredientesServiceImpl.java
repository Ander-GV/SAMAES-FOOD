package com.restaurante.api.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.restaurante.api.dto.IngredientesRequestDTO;
import com.restaurante.api.dto.IngredientesResponseDTO;
import com.restaurante.api.entity.Ingredientes;
import com.restaurante.api.entity.UnidadDeMedida;
import com.restaurante.api.exception.BusinessException;
import com.restaurante.api.exception.ResourceNotFoundException;
import com.restaurante.api.mapper.IngredientesMapper;
import com.restaurante.api.repository.IngredientesAndProductosRepository;
import com.restaurante.api.repository.IngredientesRepository;
import com.restaurante.api.repository.UnidadDeMedidaRepository;
import com.restaurante.api.service.IngredientesService;

@Service
@Transactional
public class IngredientesServiceImpl implements IngredientesService {

    private final IngredientesRepository ingredientesRepository;
    private final IngredientesMapper ingredientesMapper;
    private final UnidadDeMedidaRepository unidadDeMedidaRepository;
    private final IngredientesAndProductosRepository ingredientesAndProductosRepository;

    public IngredientesServiceImpl(
            IngredientesRepository ingredientesRepository,
            IngredientesMapper ingredientesMapper,
            UnidadDeMedidaRepository unidadDeMedidaRepository,
            IngredientesAndProductosRepository ingredientesAndProductosRepository) {
        this.ingredientesRepository = ingredientesRepository;
        this.ingredientesMapper = ingredientesMapper;
        this.unidadDeMedidaRepository = unidadDeMedidaRepository;
        this.ingredientesAndProductosRepository = ingredientesAndProductosRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<IngredientesResponseDTO> findAll() {
        return ingredientesRepository.findAll().stream()
                .map(ingredientesMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public IngredientesResponseDTO findById(Long id) {
        return ingredientesRepository.findById(id)
                .map(ingredientesMapper::toResponseDTO)
                .orElseThrow(() -> new ResourceNotFoundException("El ingrediente solicitado no fue encontrado."));
    }

    @Override
    public IngredientesResponseDTO save(IngredientesRequestDTO requestDTO) {
        String nombre = requestDTO.getNombre().trim();

        UnidadDeMedida unidadDeMedida = unidadDeMedidaRepository.findById(requestDTO.getUnidadDeMedidaId())
                .orElseThrow(() -> new ResourceNotFoundException("La unidad de medida seleccionada no existe en el sistema."));

        if (ingredientesRepository.existsByNombreIgnoreCase(nombre)) {
            throw new BusinessException("Ya existe un ingrediente registrado con el nombre: " + nombre);
        }

        Ingredientes entity = ingredientesMapper.toEntity(requestDTO);
        entity.setUnidadDeMedida(unidadDeMedida);
        Ingredientes savedEntity = ingredientesRepository.save(entity);
        return ingredientesMapper.toResponseDTO(savedEntity);
    }

    @Override
    public IngredientesResponseDTO update(Long id, IngredientesRequestDTO requestDTO) {
        String nombre = requestDTO.getNombre().trim();

        if (!ingredientesRepository.existsById(id)) {
            throw new ResourceNotFoundException("El ingrediente que intenta actualizar no existe.");
        }

        UnidadDeMedida unidadDeMedida = unidadDeMedidaRepository.findById(requestDTO.getUnidadDeMedidaId())
                .orElseThrow(() -> new ResourceNotFoundException("La unidad de medida seleccionada no existe en el sistema."));

        if (ingredientesRepository.existsByNombreIgnoreCaseAndIdNot(nombre, id)) {
            throw new BusinessException("Ya existe otro ingrediente registrado con el nombre: " + nombre);
        }

        Ingredientes entity = ingredientesMapper.toEntity(requestDTO);
        entity.setId(id);
        entity.setUnidadDeMedida(unidadDeMedida);
        Ingredientes updatedEntity = ingredientesRepository.save(entity);
        return ingredientesMapper.toResponseDTO(updatedEntity);
    }

    @Override
    public void delete(Long id) {
        if (!ingredientesRepository.existsById(id)) {
            throw new ResourceNotFoundException("El ingrediente que intenta eliminar no existe.");
        }
        if (ingredientesAndProductosRepository.existsByIngredientesId(id)) {
            throw new BusinessException("No se puede eliminar el ingrediente porque está asociado a uno o más productos.");
        }

        ingredientesRepository.deleteById(id);
    }
}
