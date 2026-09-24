package com.restaurante.api.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.restaurante.api.dto.CategoriaRequestDTO;
import com.restaurante.api.dto.CategoriaResponseDTO;
import com.restaurante.api.entity.Categoria;
import com.restaurante.api.exception.BusinessException;
import com.restaurante.api.exception.ResourceNotFoundException;
import com.restaurante.api.mapper.CategoriaMapper;
import com.restaurante.api.repository.CategoriaRepository;
import com.restaurante.api.repository.ProductosRepository;
import com.restaurante.api.service.CategoriaService;

@Service
@Transactional
public class CategoriaServiceImpl implements CategoriaService {

    private final ProductosRepository productosRepository;
    private final CategoriaRepository categoriaRepository;
    private final CategoriaMapper categoriaMapper;

    public CategoriaServiceImpl(CategoriaRepository categoriaRepository, CategoriaMapper categoriaMapper, ProductosRepository productosRepository) {
        this.categoriaRepository = categoriaRepository;
        this.categoriaMapper = categoriaMapper;
        this.productosRepository = productosRepository;
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "categorias")
    public List<CategoriaResponseDTO> findAll() {
        return categoriaRepository.findAll().stream()
                .map(categoriaMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CategoriaResponseDTO findById(Long id) {
        return categoriaRepository.findById(id)
                .map(categoriaMapper::toResponseDTO)
                .orElseThrow(() -> new ResourceNotFoundException("La categoría solicitada no fue encontrada."));
    }

    @Override
    @Caching(evict = {
        @CacheEvict(value = "categorias", allEntries = true),
        @CacheEvict(value = "productos", allEntries = true)
    })
    public CategoriaResponseDTO save(CategoriaRequestDTO requestDTO) {
        String nombre = requestDTO.getNombre().trim();
        if (existByNombreIgnoreCase(nombre)) {
            throw new BusinessException("Ya existe una categoría registrada con el nombre: " + nombre);
        }
        Categoria entity = categoriaMapper.toEntity(requestDTO);
        Categoria savedEntity = categoriaRepository.save(entity);
        return categoriaMapper.toResponseDTO(savedEntity);
    }

    @Override
    @Caching(evict = {
        @CacheEvict(value = "categorias", allEntries = true),
        @CacheEvict(value = "productos", allEntries = true)
    })
    public CategoriaResponseDTO update(Long id, CategoriaRequestDTO requestDTO) {
        if (!categoriaRepository.existsById(id)) {
            throw new ResourceNotFoundException("La categoría que intenta actualizar no existe.");
        }
        String nombre = requestDTO.getNombre().trim();
        if (categoriaRepository.existsByNombreIgnoreCaseAndIdNot(nombre, id)) {
            throw new BusinessException("Ya existe otra categoría registrada con el nombre: " + nombre);
        }
        Categoria entity = categoriaMapper.toEntity(requestDTO);
        entity.setId(id);
        Categoria updatedEntity = categoriaRepository.save(entity);
        return categoriaMapper.toResponseDTO(updatedEntity);
    }

    @Override
    @Caching(evict = {
        @CacheEvict(value = "categorias", allEntries = true),
        @CacheEvict(value = "productos", allEntries = true)
    })
    public void delete(Long id) {
        if (!categoriaRepository.existsById(id)) {
            throw new ResourceNotFoundException("La categoría que intenta eliminar no existe.");
        }
        if(productosRepository.existsByCategoriaId(id)){
            throw new BusinessException("No se puede eliminar la categoría porque tiene productos asociados.");
        }
        categoriaRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existByNombreIgnoreCase(String nombre) {
        return categoriaRepository.existsByNombreIgnoreCase(nombre);
    }
}
