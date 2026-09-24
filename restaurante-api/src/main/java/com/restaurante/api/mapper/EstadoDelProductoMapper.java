package com.restaurante.api.mapper;

import com.restaurante.api.dto.EstadoDelProductoRequestDTO;
import com.restaurante.api.dto.EstadoDelProductoResponseDTO;
import com.restaurante.api.entity.EstadoDelProducto;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface EstadoDelProductoMapper {

    EstadoDelProducto toEntity(EstadoDelProductoRequestDTO requestDTO);

    EstadoDelProductoResponseDTO toResponseDTO(EstadoDelProducto entity);
}
