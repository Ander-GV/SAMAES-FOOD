package com.restaurante.api.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

import com.restaurante.api.dto.GastoRequestDTO;
import com.restaurante.api.dto.GastoResponseDTO;
import com.restaurante.api.entity.Gasto;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE)
public interface GastoMapper {

    @Mapping(source = "empleadoId", target = "empleado.id")
    @Mapping(source = "usuarioId", target = "usuario.id")
    Gasto toEntity(GastoRequestDTO requestDTO);

    @Mapping(source = "empleado.id", target = "empleadoId")
    @Mapping(target = "nombreEmpleado", expression = "java(entity.getEmpleado() != null ? (entity.getEmpleado().getNombre() + (entity.getEmpleado().getApellido() != null ? \" \" + entity.getEmpleado().getApellido() : \"\")).trim() : null)")
    @Mapping(source = "usuario.id", target = "usuarioId")
    @Mapping(source = "usuario.codigoEmpleado", target = "codigoEmpleadoUsuario")
    GastoResponseDTO toResponseDTO(Gasto entity);
}
