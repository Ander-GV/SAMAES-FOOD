package com.restaurante.api.unit;

import com.restaurante.api.dto.PromocionRequestDTO;
import com.restaurante.api.dto.PromocionResponseDTO;
import com.restaurante.api.entity.Promocion;
import com.restaurante.api.enums.TipoDescuento;
import com.restaurante.api.exception.BusinessException;
import com.restaurante.api.exception.ResourceNotFoundException;
import com.restaurante.api.mapper.PromocionMapper;
import com.restaurante.api.repository.PromocionRepository;
import com.restaurante.api.service.impl.PromocionServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PromocionServiceUnitTest {

    @Mock
    private PromocionRepository promocionRepository;
    @Mock
    private PromocionMapper promocionMapper;

    @InjectMocks
    private PromocionServiceImpl promocionService;

    private Promocion promoActiva;
    private Promocion promoInactiva;

    @BeforeEach
    void setUp() {
        promoActiva = new Promocion();
        promoActiva.setId(1L);
        promoActiva.setNombre("Descuento Verano");
        promoActiva.setTipoDescuento(TipoDescuento.PORCENTAJE);
        promoActiva.setValor(new BigDecimal("10.00"));
        promoActiva.setActiva(true);
        promoActiva.setCodigoCupon("VERANO10");
        promoActiva.setUsosMaximos(5);
        promoActiva.setUsosActuales(0);

        promoInactiva = new Promocion();
        promoInactiva.setId(2L);
        promoInactiva.setNombre("Promo Expirada");
        promoInactiva.setTipoDescuento(TipoDescuento.MONTO_FIJO);
        promoInactiva.setValor(new BigDecimal("5000.00"));
        promoInactiva.setActiva(false);
        promoInactiva.setCodigoCupon("EXPIRADO");
    }

    @Test
    @DisplayName("Debe encontrar cupón activo exitosamente e incrementar su uso")
    void testFindByCodigoCupon_ActiveSuccess() {
        PromocionResponseDTO responseDTO = new PromocionResponseDTO();
        responseDTO.setCodigoCupon("VERANO10");
        responseDTO.setActiva(true);

        when(promocionRepository.findByCodigoCuponAndActivaTrue("VERANO10")).thenReturn(Optional.of(promoActiva));
        when(promocionRepository.save(promoActiva)).thenReturn(promoActiva);
        when(promocionMapper.toResponseDTO(promoActiva)).thenReturn(responseDTO);

        PromocionResponseDTO result = promocionService.findByCodigoCupon("VERANO10");

        assertNotNull(result);
        assertEquals("VERANO10", result.getCodigoCupon());
        assertEquals(1, promoActiva.getUsosActuales(), "El contador de usos debe haberse incrementado a 1");
        verify(promocionRepository, times(1)).save(promoActiva);
    }

    @Test
    @DisplayName("Debe lanzar ResourceNotFoundException si el cupón está inactivo o no existe")
    void testFindByCodigoCupon_InactiveOrNotFound_ThrowsException() {
        when(promocionRepository.findByCodigoCuponAndActivaTrue("EXPIRADO")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> promocionService.findByCodigoCupon("EXPIRADO"));
        verify(promocionRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe lanzar BusinessException si el cupón alcanzó el límite de usos máximos")
    void testFindByCodigoCupon_MaxUsagesReached_ThrowsException() {
        promoActiva.setUsosMaximos(3);
        promoActiva.setUsosActuales(3);

        when(promocionRepository.findByCodigoCuponAndActivaTrue("VERANO10")).thenReturn(Optional.of(promoActiva));

        assertThrows(BusinessException.class, () -> promocionService.findByCodigoCupon("VERANO10"));
        verify(promocionRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe impedir crear cupón duplicado si ya existe una promoción activa con el mismo código")
    void testSave_DuplicateActiveCoupon_ThrowsBusinessException() {
        PromocionRequestDTO request = new PromocionRequestDTO();
        request.setNombre("Otro Descuento");
        request.setCodigoCupon("VERANO10");
        request.setActiva(true);

        when(promocionRepository.findByCodigoCuponAndActivaTrue("VERANO10")).thenReturn(Optional.of(promoActiva));

        assertThrows(BusinessException.class, () -> promocionService.save(request));
        verify(promocionRepository, never()).save(any(Promocion.class));
    }

    @Test
    @DisplayName("Debe retornar promoción elegible por monto si existe activa en el rango")
    void testObtenerPromocionElegible_Success() {
        when(promocionRepository.findPromocionesElegiblesPorMonto(any(BigDecimal.class), any(LocalDateTime.class)))
                .thenReturn(List.of(promoActiva));
        PromocionResponseDTO responseDTO = new PromocionResponseDTO();
        responseDTO.setId(1L);
        when(promocionMapper.toResponseDTO(promoActiva)).thenReturn(responseDTO);

        PromocionResponseDTO elegible = promocionService.obtenerPromocionElegible(new BigDecimal("100000"));

        assertNotNull(elegible);
        assertEquals(1L, elegible.getId());
    }
}
