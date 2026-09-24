package com.restaurante.api.mapper;

import com.restaurante.api.dto.PromocionRequestDTO;
import com.restaurante.api.dto.PromocionResponseDTO;
import com.restaurante.api.entity.Promocion;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PromocionMapper {

    Promocion toEntity(PromocionRequestDTO requestDTO);

    PromocionResponseDTO toResponseDTO(Promocion entity);
}
