package com.restaurante.api.mapper;

import com.restaurante.api.dto.MesaRequestDTO;
import com.restaurante.api.dto.MesaResponseDTO;
import com.restaurante.api.entity.Mesa;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface MesaMapper {

    Mesa toEntity(MesaRequestDTO requestDTO);

    MesaResponseDTO toResponseDTO(Mesa entity);
}
