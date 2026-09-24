package com.restaurante.api.mapper;

import com.restaurante.api.dto.ProveedoresRequestDTO;
import com.restaurante.api.dto.ProveedoresResponseDTO;
import com.restaurante.api.entity.Proveedores;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface ProveedoresMapper {

    Proveedores toEntity(ProveedoresRequestDTO requestDTO);

    ProveedoresResponseDTO toResponseDTO(Proveedores entity);
}
