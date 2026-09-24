package com.restaurante.api.mapper;

import com.restaurante.api.dto.IngredientesAndProductosRequestDTO;
import com.restaurante.api.dto.IngredientesAndProductosResponseDTO;
import com.restaurante.api.entity.IngredientesAndProductos;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE)
public interface IngredientesAndProductosMapper {

    IngredientesAndProductos toEntity(IngredientesAndProductosRequestDTO requestDTO);

    IngredientesAndProductosResponseDTO toResponseDTO(IngredientesAndProductos entity);
}
