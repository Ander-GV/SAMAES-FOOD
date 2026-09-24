package com.restaurante.api.mapper;

import com.restaurante.api.dto.PagosRequestDTO;
import com.restaurante.api.dto.PagosResponseDTO;
import com.restaurante.api.entity.Pagos;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(
    componentModel = MappingConstants.ComponentModel.SPRING,
    uses = {PedidosMapper.class, TipoDePagoMapper.class, UsuariosMapper.class},
    unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE
)
public interface PagosMapper {

    @Mapping(source = "pedidoId", target = "pedido.id")
    @Mapping(source = "tipoPagoId", target = "tipoPago.id")
    @Mapping(source = "usuarioId", target = "usuario.id")
    Pagos toEntity(PagosRequestDTO requestDTO);

    PagosResponseDTO toResponseDTO(Pagos entity);
}
