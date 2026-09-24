package com.restaurante.api.service.impl;

import com.restaurante.api.dto.ProveedoresRequestDTO;
import com.restaurante.api.dto.ProveedoresResponseDTO;
import com.restaurante.api.entity.MovimientosDelInventario;
import com.restaurante.api.entity.Proveedores;
import com.restaurante.api.exception.BusinessException;
import com.restaurante.api.exception.ResourceNotFoundException;
import com.restaurante.api.mapper.ProveedoresMapper;
import com.restaurante.api.repository.MovimientosDelInventarioRepository;
import com.restaurante.api.repository.ProveedoresRepository;
import com.restaurante.api.service.ProveedoresService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProveedoresServiceImpl implements ProveedoresService {

    private final ProveedoresRepository proveedoresRepository;
    private final ProveedoresMapper proveedoresMapper;
    private final MovimientosDelInventarioRepository movimientosDelInventarioRepository;

    public ProveedoresServiceImpl(
            ProveedoresRepository proveedoresRepository, 
            ProveedoresMapper proveedoresMapper,
            MovimientosDelInventarioRepository movimientosDelInventarioRepository) {
        this.proveedoresRepository = proveedoresRepository;
        this.proveedoresMapper = proveedoresMapper;
        this.movimientosDelInventarioRepository = movimientosDelInventarioRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProveedoresResponseDTO> findAll() {
        return proveedoresRepository.findAll().stream()
                .map(proveedoresMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ProveedoresResponseDTO findById(Long id) {
        return proveedoresRepository.findById(id)
                .map(proveedoresMapper::toResponseDTO)
                .orElseThrow(() -> new ResourceNotFoundException("El proveedor solicitado no fue encontrado."));
    }

    @Override
    public ProveedoresResponseDTO save(ProveedoresRequestDTO requestDTO) {
        String nombre = requestDTO.getNombre().trim();
        if (proveedoresRepository.existsByNombreIgnoreCase(nombre)) {
            throw new BusinessException("Ya existe un proveedor registrado con el nombre: " + nombre);
        }
        if (requestDTO.getNit() != null && !requestDTO.getNit().isBlank()) {
            String nit = requestDTO.getNit().trim();
            if (proveedoresRepository.existsByNitIgnoreCase(nit)) {
                throw new BusinessException("Ya existe un proveedor registrado con el NIT: " + nit);
            }
        }
        Proveedores entity = proveedoresMapper.toEntity(requestDTO);
        Proveedores savedEntity = proveedoresRepository.save(entity);
        return proveedoresMapper.toResponseDTO(savedEntity);
    }

    @Override
    public ProveedoresResponseDTO update(Long id, ProveedoresRequestDTO requestDTO) {
        if (!proveedoresRepository.existsById(id)) {
            throw new ResourceNotFoundException("El proveedor que intenta actualizar no existe.");
        }
        String nombre = requestDTO.getNombre().trim();
        if (proveedoresRepository.existsByNombreIgnoreCaseAndIdNot(nombre, id)) {
            throw new BusinessException("Ya existe otro proveedor registrado con el nombre: " + nombre);
        }
        if (requestDTO.getNit() != null && !requestDTO.getNit().isBlank()) {
            String nit = requestDTO.getNit().trim();
            if (proveedoresRepository.existsByNitIgnoreCaseAndIdNot(nit, id)) {
                throw new BusinessException("Ya existe otro proveedor registrado con el NIT: " + nit);
            }
        }
        Proveedores entity = proveedoresMapper.toEntity(requestDTO);
        entity.setId(id);
        Proveedores updatedEntity = proveedoresRepository.save(entity);
        return proveedoresMapper.toResponseDTO(updatedEntity);
    }

    @Override
    public void delete(Long id) {
        if (!proveedoresRepository.existsById(id)) {
            throw new ResourceNotFoundException("El proveedor que intenta eliminar no existe.");
        }
        // Desvincular movimientos de inventario asociados para permitir la eliminación sin error FK
        List<MovimientosDelInventario> movimientos = movimientosDelInventarioRepository.findAll().stream()
                .filter(m -> m.getProveedor() != null && id.equals(m.getProveedor().getId()))
                .collect(Collectors.toList());
        for (MovimientosDelInventario m : movimientos) {
            m.setProveedor(null);
            movimientosDelInventarioRepository.save(m);
        }

        proveedoresRepository.deleteById(id);
    }
}
