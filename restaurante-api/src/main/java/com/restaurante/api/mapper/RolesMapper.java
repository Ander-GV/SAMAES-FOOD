package com.restaurante.api.mapper;

import com.restaurante.api.dto.RolesRequestDTO;
import com.restaurante.api.dto.RolesResponseDTO;
import com.restaurante.api.entity.Roles;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface RolesMapper {

    Roles toEntity(RolesRequestDTO requestDTO);

    RolesResponseDTO toResponseDTO(Roles entity);
}
