package com.restaurante.api.mapper;

import com.restaurante.api.dto.ClienteRequestDTO;
import com.restaurante.api.dto.ClienteResponseDTO;
import com.restaurante.api.entity.Cliente;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface ClienteMapper {

    Cliente toEntity(ClienteRequestDTO requestDTO);

    ClienteResponseDTO toResponseDTO(Cliente entity);
}
