package com.restaurante.api.service.impl;

import com.restaurante.api.dto.RolesRequestDTO;
import com.restaurante.api.dto.RolesResponseDTO;
import com.restaurante.api.entity.Roles;
import com.restaurante.api.exception.ResourceNotFoundException;
import com.restaurante.api.mapper.RolesMapper;
import com.restaurante.api.repository.RolesRepository;
import com.restaurante.api.service.RolesService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class RolesServiceImpl implements RolesService {

    private final RolesRepository rolesRepository;
    private final RolesMapper rolesMapper;

    public RolesServiceImpl(RolesRepository rolesRepository, RolesMapper rolesMapper) {
        this.rolesRepository = rolesRepository;
        this.rolesMapper = rolesMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<RolesResponseDTO> findAll() {
        return rolesRepository.findAll().stream()
                .map(rolesMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public RolesResponseDTO findById(Long id) {
        return rolesRepository.findById(id)
                .map(rolesMapper::toResponseDTO)
                .orElseThrow(() -> new ResourceNotFoundException("El rol de usuario solicitado no fue encontrado."));
    }

    @Override
    public RolesResponseDTO save(RolesRequestDTO requestDTO) {
        Roles entity = rolesMapper.toEntity(requestDTO);
        Roles savedEntity = rolesRepository.save(entity);
        return rolesMapper.toResponseDTO(savedEntity);
    }

    @Override
    public RolesResponseDTO update(Long id, RolesRequestDTO requestDTO) {
        if (!rolesRepository.existsById(id)) {
            throw new ResourceNotFoundException("El rol de usuario que intenta actualizar no existe.");
        }
        Roles entity = rolesMapper.toEntity(requestDTO);
        entity.setId(id);
        Roles updatedEntity = rolesRepository.save(entity);
        return rolesMapper.toResponseDTO(updatedEntity);
    }

    @Override
    public void delete(Long id) {
        if (!rolesRepository.existsById(id)) {
            throw new ResourceNotFoundException("El rol de usuario que intenta eliminar no existe.");
        }
        rolesRepository.deleteById(id);
    }
}
