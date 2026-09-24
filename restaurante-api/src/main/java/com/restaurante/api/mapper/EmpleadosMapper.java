package com.restaurante.api.mapper;

import com.restaurante.api.dto.EmpleadosRequestDTO;
import com.restaurante.api.dto.EmpleadosResponseDTO;
import com.restaurante.api.entity.Empleados;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface EmpleadosMapper {

    Empleados toEntity(EmpleadosRequestDTO requestDTO);

    EmpleadosResponseDTO toResponseDTO(Empleados entity);
}
