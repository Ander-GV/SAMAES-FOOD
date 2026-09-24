package com.restaurante.api.mapper;

import com.restaurante.api.dto.MovimientosDelInventarioRequestDTO;
import com.restaurante.api.dto.MovimientosDelInventarioResponseDTO;
import com.restaurante.api.entity.MovimientosDelInventario;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE)
public interface MovimientosDelInventarioMapper {

    MovimientosDelInventario toEntity(MovimientosDelInventarioRequestDTO requestDTO);

    MovimientosDelInventarioResponseDTO toResponseDTO(MovimientosDelInventario entity);
}
