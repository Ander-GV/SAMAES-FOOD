package com.restaurante.api.service.impl;

import com.restaurante.api.dto.PromocionRequestDTO;
import com.restaurante.api.dto.PromocionResponseDTO;
import com.restaurante.api.entity.Promocion;
import com.restaurante.api.exception.BusinessException;
import com.restaurante.api.exception.ResourceNotFoundException;
import com.restaurante.api.mapper.PromocionMapper;
import com.restaurante.api.repository.PromocionRepository;
import com.restaurante.api.service.PromocionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PromocionServiceImpl implements PromocionService {

    private final PromocionRepository promocionRepository;
    private final PromocionMapper promocionMapper;

    public PromocionServiceImpl(PromocionRepository promocionRepository, PromocionMapper promocionMapper) {
        this.promocionRepository = promocionRepository;
        this.promocionMapper = promocionMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<PromocionResponseDTO> findAll() {
        return promocionRepository.findAll().stream()
                .map(promocionMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PromocionResponseDTO findById(Long id) {
        return promocionRepository.findById(id)
                .map(promocionMapper::toResponseDTO)
                .orElseThrow(() -> new ResourceNotFoundException("La promoción solicitada no fue encontrada."));
    }

    @Override
    public PromocionResponseDTO save(PromocionRequestDTO requestDTO) {
        if (requestDTO.getCodigoCupon() != null && !requestDTO.getCodigoCupon().isBlank()) {
            String codigoUpper = requestDTO.getCodigoCupon().trim().toUpperCase();
            if (promocionRepository.findByCodigoCuponAndActivaTrue(codigoUpper).isPresent()) {
                throw new BusinessException("Ya existe una promoción activa con el código de cupón: " + codigoUpper);
            }
            requestDTO.setCodigoCupon(codigoUpper);
        }

        if (requestDTO.getUsosActuales() == null) {
            requestDTO.setUsosActuales(0);
        }

        Promocion entity = promocionMapper.toEntity(requestDTO);
        Promocion savedEntity = promocionRepository.save(entity);
        return promocionMapper.toResponseDTO(savedEntity);
    }

    @Override
    public PromocionResponseDTO update(Long id, PromocionRequestDTO requestDTO) {
        if (!promocionRepository.existsById(id)) {
            throw new ResourceNotFoundException("La promoción que intenta actualizar no existe.");
        }

        if (requestDTO.getCodigoCupon() != null && !requestDTO.getCodigoCupon().isBlank()) {
            requestDTO.setCodigoCupon(requestDTO.getCodigoCupon().trim().toUpperCase());
        }

        Promocion entity = promocionMapper.toEntity(requestDTO);
        entity.setId(id);
        Promocion updatedEntity = promocionRepository.save(entity);
        return promocionMapper.toResponseDTO(updatedEntity);
    }

    @Override
    public void delete(Long id) {
        if (!promocionRepository.existsById(id)) {
            throw new ResourceNotFoundException("La promoción que intenta eliminar no existe.");
        }
        promocionRepository.deleteById(id);
    }

    @Override
    public PromocionResponseDTO findByCodigoCupon(String codigoCupon) {
        if (codigoCupon == null || codigoCupon.isBlank()) {
            return null;
        }
        Promocion promo = promocionRepository.findByCodigoCuponAndActivaTrue(codigoCupon.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Cupón de promoción no válido o expirado."));

        // Validar si alcanzó el límite de usos máximos permitidos
        if (promo.getUsosMaximos() != null && promo.getUsosMaximos() > 0 && promo.getUsosActuales() != null) {
            if (promo.getUsosActuales() >= promo.getUsosMaximos()) {
                throw new BusinessException("El cupón ha alcanzado el límite máximo de (" + promo.getUsosMaximos() + ") usos permitidos.");
            }
        }

        // Incrementar el conteo de uso del cupón al aplicarlo
        promo.setUsosActuales((promo.getUsosActuales() == null ? 0 : promo.getUsosActuales()) + 1);
        promocionRepository.save(promo);

        return promocionMapper.toResponseDTO(promo);
    }

    @Override
    @Transactional(readOnly = true)
    public PromocionResponseDTO obtenerPromocionElegible(BigDecimal subtotal) {
        if (subtotal == null || subtotal.compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }
        List<Promocion> elegibles = promocionRepository.findPromocionesElegiblesPorMonto(subtotal, LocalDateTime.now());
        if (elegibles.isEmpty()) {
            return null;
        }
        return promocionMapper.toResponseDTO(elegibles.get(0));
    }
}
