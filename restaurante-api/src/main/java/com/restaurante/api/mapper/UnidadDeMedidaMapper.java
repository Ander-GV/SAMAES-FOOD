package com.restaurante.api.mapper;

import com.restaurante.api.dto.UnidadDeMedidaRequestDTO;
import com.restaurante.api.dto.UnidadDeMedidaResponseDTO;
import com.restaurante.api.entity.UnidadDeMedida;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface UnidadDeMedidaMapper {

    UnidadDeMedida toEntity(UnidadDeMedidaRequestDTO requestDTO);

    UnidadDeMedidaResponseDTO toResponseDTO(UnidadDeMedida entity);
}
