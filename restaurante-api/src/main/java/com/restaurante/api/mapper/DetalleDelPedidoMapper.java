package com.restaurante.api.mapper;

import com.restaurante.api.dto.DetalleDelPedidoRequestDTO;
import com.restaurante.api.dto.DetalleDelPedidoResponseDTO;
import com.restaurante.api.entity.DetalleDelPedido;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE)
public interface DetalleDelPedidoMapper {

    @Mapping(source = "pedidoId", target = "pedido.id")
    @Mapping(source = "productoId", target = "producto.id")
    DetalleDelPedido toEntity(DetalleDelPedidoRequestDTO requestDTO);

    @Mapping(source = "producto.nombre", target = "nombreProducto")
    DetalleDelPedidoResponseDTO toResponseDTO(DetalleDelPedido entity);
}
