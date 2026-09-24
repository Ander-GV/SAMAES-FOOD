package com.restaurante.api.mapper;

import com.restaurante.api.dto.TipoDeMovimientoRequestDTO;
import com.restaurante.api.dto.TipoDeMovimientoResponseDTO;
import com.restaurante.api.entity.TipoDeMovimiento;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface TipoDeMovimientoMapper {

    TipoDeMovimiento toEntity(TipoDeMovimientoRequestDTO requestDTO);

    TipoDeMovimientoResponseDTO toResponseDTO(TipoDeMovimiento entity);
}
