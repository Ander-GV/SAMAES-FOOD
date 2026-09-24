package com.restaurante.api.mapper;

import com.restaurante.api.dto.UsuariosRequestDTO;
import com.restaurante.api.dto.UsuariosResponseDTO;
import com.restaurante.api.entity.Usuarios;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface UsuariosMapper {

    Usuarios toEntity(UsuariosRequestDTO requestDTO);

    UsuariosResponseDTO toResponseDTO(Usuarios entity);
}
