package com.restaurante.api.mapper;

import com.restaurante.api.dto.TipoDePedidosRequestDTO;
import com.restaurante.api.dto.TipoDePedidosResponseDTO;
import com.restaurante.api.entity.TipoDePedidos;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface TipoDePedidosMapper {

    TipoDePedidos toEntity(TipoDePedidosRequestDTO requestDTO);

    TipoDePedidosResponseDTO toResponseDTO(TipoDePedidos entity);
}
