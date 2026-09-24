package com.restaurante.api.mapper;

import com.restaurante.api.dto.IngredientesRequestDTO;
import com.restaurante.api.dto.IngredientesResponseDTO;
import com.restaurante.api.entity.Ingredientes;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(
    componentModel = MappingConstants.ComponentModel.SPRING,
    uses = {UnidadDeMedidaMapper.class},
    unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE
)
public interface IngredientesMapper {

    @Mapping(source = "unidadDeMedidaId", target = "unidadDeMedida.id")
    Ingredientes toEntity(IngredientesRequestDTO requestDTO);

    IngredientesResponseDTO toResponseDTO(Ingredientes entity);
}
