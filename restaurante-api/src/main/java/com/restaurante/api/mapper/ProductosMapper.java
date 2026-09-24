package com.restaurante.api.mapper;

import com.restaurante.api.dto.ProductosRequestDTO;
import com.restaurante.api.dto.ProductosResponseDTO;
import com.restaurante.api.entity.Productos;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(
    componentModel = MappingConstants.ComponentModel.SPRING,
    uses = {CategoriaMapper.class, EstadoDelProductoMapper.class},
    unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE
)
public interface ProductosMapper {

    @Mapping(source = "categoriaId", target = "categoria.id")
    Productos toEntity(ProductosRequestDTO requestDTO);

    ProductosResponseDTO toResponseDTO(Productos entity);
}
