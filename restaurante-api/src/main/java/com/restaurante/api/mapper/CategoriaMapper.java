package com.restaurante.api.mapper;

import com.restaurante.api.dto.CategoriaRequestDTO;
import com.restaurante.api.dto.CategoriaResponseDTO;
import com.restaurante.api.entity.Categoria;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface CategoriaMapper {

    Categoria toEntity(CategoriaRequestDTO requestDTO);

    CategoriaResponseDTO toResponseDTO(Categoria entity);
}
