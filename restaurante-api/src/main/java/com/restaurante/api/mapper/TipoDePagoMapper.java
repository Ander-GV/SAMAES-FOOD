package com.restaurante.api.mapper;

import com.restaurante.api.dto.TipoDePagoRequestDTO;
import com.restaurante.api.dto.TipoDePagoResponseDTO;
import com.restaurante.api.entity.TipoDePago;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface TipoDePagoMapper {

    TipoDePago toEntity(TipoDePagoRequestDTO requestDTO);

    TipoDePagoResponseDTO toResponseDTO(TipoDePago entity);
}
