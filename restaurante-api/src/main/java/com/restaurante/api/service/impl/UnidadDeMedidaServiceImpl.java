package com.restaurante.api.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.restaurante.api.dto.UnidadDeMedidaRequestDTO;
import com.restaurante.api.dto.UnidadDeMedidaResponseDTO;
import com.restaurante.api.entity.UnidadDeMedida;
import com.restaurante.api.exception.BusinessException;
import com.restaurante.api.exception.ResourceNotFoundException;
import com.restaurante.api.mapper.UnidadDeMedidaMapper;
import com.restaurante.api.repository.IngredientesRepository;
import com.restaurante.api.repository.UnidadDeMedidaRepository;
import com.restaurante.api.service.UnidadDeMedidaService;

@Service
@Transactional
public class UnidadDeMedidaServiceImpl implements UnidadDeMedidaService {

    private final UnidadDeMedidaRepository unidadDeMedidaRepository;
    private final UnidadDeMedidaMapper unidadDeMedidaMapper;
    private final IngredientesRepository ingredientesRepository;

    public UnidadDeMedidaServiceImpl(UnidadDeMedidaRepository unidadDeMedidaRepository, UnidadDeMedidaMapper unidadDeMedidaMapper, IngredientesRepository ingredientesRepository) {
        this.unidadDeMedidaRepository = unidadDeMedidaRepository;
        this.unidadDeMedidaMapper = unidadDeMedidaMapper;
        this.ingredientesRepository = ingredientesRepository;
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "unidadesMedida")
    public List<UnidadDeMedidaResponseDTO> findAll() {
        return unidadDeMedidaRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UnidadDeMedidaResponseDTO findById(Long id) {
        return unidadDeMedidaRepository.findById(id)
                .map(this::mapToDTO)
                .orElseThrow(() -> new ResourceNotFoundException("La unidad de medida solicitada no fue encontrada."));
    }

    @Override
    @CacheEvict(value = "unidadesMedida", allEntries = true)
    public UnidadDeMedidaResponseDTO save(UnidadDeMedidaRequestDTO requestDTO) {
        String nombre = requestDTO.getNombre().trim();
        String abreviatura = requestDTO.getAbreviatura().trim();
        if (existByNombreIgnoreCaseAndIdNot(nombre, null)) {
            throw new BusinessException("Ya existe una unidad de medida registrada con el nombre: " + nombre);
        }
        if (existByAbreviaturaIgnoreCaseAndIdNot(abreviatura, null)) {
            throw new BusinessException("Ya existe una unidad de medida registrada con la abreviatura: " + abreviatura);
        }

        UnidadDeMedida entity = unidadDeMedidaMapper.toEntity(requestDTO);
        if (requestDTO.getTipoDeUnidad() != null && !requestDTO.getTipoDeUnidad().isBlank()) {
            entity.setTipoDeUnidad(requestDTO.getTipoDeUnidad().trim().toUpperCase());
        }

        UnidadDeMedida savedEntity = unidadDeMedidaRepository.save(entity);
        return mapToDTO(savedEntity);
    }

    @Override
    @CacheEvict(value = "unidadesMedida", allEntries = true)
    public UnidadDeMedidaResponseDTO update(Long id, UnidadDeMedidaRequestDTO requestDTO) {
        String nombre = requestDTO.getNombre().trim();
        String abreviatura = requestDTO.getAbreviatura().trim();

        if (!unidadDeMedidaRepository.existsById(id)) {
            throw new ResourceNotFoundException("La unidad de medida que intenta actualizar no existe.");
        }

        if (existByNombreIgnoreCaseAndIdNot(nombre, id)) {
            throw new BusinessException("Ya existe otra unidad de medida registrada con el nombre: " + nombre);
        }
        if (existByAbreviaturaIgnoreCaseAndIdNot(abreviatura, id)) {
            throw new BusinessException("Ya existe otra unidad de medida registrada con la abreviatura: " + abreviatura);
        }

        UnidadDeMedida entity = unidadDeMedidaMapper.toEntity(requestDTO);
        entity.setId(id);
        if (requestDTO.getTipoDeUnidad() != null && !requestDTO.getTipoDeUnidad().isBlank()) {
            entity.setTipoDeUnidad(requestDTO.getTipoDeUnidad().trim().toUpperCase());
        }

        UnidadDeMedida updatedEntity = unidadDeMedidaRepository.save(entity);
        return mapToDTO(updatedEntity);
    }

    @Override
    @CacheEvict(value = "unidadesMedida", allEntries = true)
    public void delete(Long id) {
        if (!unidadDeMedidaRepository.existsById(id)) {
            throw new ResourceNotFoundException("La unidad de medida que intenta eliminar no existe.");
        }
        if (ingredientesRepository.existsByUnidadDeMedidaId(id)) {
            throw new BusinessException("No se puede eliminar la unidad de medida porque está asociada a uno o más ingredientes.");
        }
        unidadDeMedidaRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existByNombreIgnoreCaseAndIdNot(String nombre, Long id) {
        return unidadDeMedidaRepository.existsByNombreIgnoreCaseAndIdNot(nombre, id);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existByAbreviaturaIgnoreCaseAndIdNot(String abreviatura, Long id) {
        return unidadDeMedidaRepository.existsByAbreviaturaIgnoreCaseAndIdNot(abreviatura, id);
    }

    private UnidadDeMedidaResponseDTO mapToDTO(UnidadDeMedida entity) {
        UnidadDeMedidaResponseDTO dto = unidadDeMedidaMapper.toResponseDTO(entity);
        if (dto != null) {
            dto.setTipoDeUnidad(entity.getTipoDeUnidad());
        }
        return dto;
    }
}
