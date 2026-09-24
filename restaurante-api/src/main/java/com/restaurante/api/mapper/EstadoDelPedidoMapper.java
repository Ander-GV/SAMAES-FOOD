package com.restaurante.api.mapper;

import com.restaurante.api.dto.EstadoDelPedidoRequestDTO;
import com.restaurante.api.dto.EstadoDelPedidoResponseDTO;
import com.restaurante.api.entity.EstadoDelPedido;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE)
public interface EstadoDelPedidoMapper {

    EstadoDelPedido toEntity(EstadoDelPedidoRequestDTO requestDTO);

    EstadoDelPedidoResponseDTO toResponseDTO(EstadoDelPedido entity);
}
