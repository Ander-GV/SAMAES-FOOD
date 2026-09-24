package com.restaurante.api.mapper;

import com.restaurante.api.dto.PedidosRequestDTO;
import com.restaurante.api.dto.PedidosResponseDTO;
import com.restaurante.api.entity.Pedidos;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, uses = {PromocionMapper.class}, unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE)
public interface PedidosMapper {

    Pedidos toEntity(PedidosRequestDTO requestDTO);

    PedidosResponseDTO toResponseDTO(Pedidos entity);
}
