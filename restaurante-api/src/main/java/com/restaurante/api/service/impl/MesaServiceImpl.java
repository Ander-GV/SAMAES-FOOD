package com.restaurante.api.service.impl;

import com.restaurante.api.dto.MesaRequestDTO;
import com.restaurante.api.dto.MesaResponseDTO;
import com.restaurante.api.entity.Mesa;
import com.restaurante.api.exception.BusinessException;
import com.restaurante.api.exception.ResourceNotFoundException;
import com.restaurante.api.mapper.MesaMapper;
import com.restaurante.api.repository.MesaRepository;
import com.restaurante.api.repository.PedidosRepository;
import com.restaurante.api.service.MesaService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class MesaServiceImpl implements MesaService {

    private final MesaRepository mesaRepository;
    private final MesaMapper mesaMapper;
    private final PedidosRepository pedidosRepository;

    public MesaServiceImpl(MesaRepository mesaRepository, MesaMapper mesaMapper, PedidosRepository pedidosRepository) {
        this.mesaRepository = mesaRepository;
        this.mesaMapper = mesaMapper;
        this.pedidosRepository = pedidosRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<MesaResponseDTO> findAll() {
        return mesaRepository.findAll().stream()
                .map(mesaMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public MesaResponseDTO findById(Long id) {
        return mesaRepository.findById(id)
                .map(mesaMapper::toResponseDTO)
                .orElseThrow(() -> new ResourceNotFoundException("La mesa solicitada no fue encontrada."));
    }

    @Override
    public MesaResponseDTO save(MesaRequestDTO requestDTO) {
        int numeroMesa = requestDTO.getNumeroMesa();
        if (mesaRepository.existsByNumeroMesa(numeroMesa)) {
            throw new BusinessException("El número de mesa " + numeroMesa + " ya se encuentra asignado a otra mesa.");
        }
        Mesa entity = mesaMapper.toEntity(requestDTO);
        Mesa savedEntity = mesaRepository.save(entity);
        return mesaMapper.toResponseDTO(savedEntity);
    }

    @Override
    public MesaResponseDTO update(Long id, MesaRequestDTO requestDTO) {
        int numeroMesa = requestDTO.getNumeroMesa();
        if (!mesaRepository.existsById(id)) {
            throw new ResourceNotFoundException("La mesa que intenta actualizar no existe.");
        }
        if (mesaRepository.existsByNumeroMesaAndIdNot(numeroMesa, id)) {
            throw new BusinessException("El número de mesa " + numeroMesa + " ya se encuentra asignado a otra mesa.");
        }
        Mesa entity = mesaMapper.toEntity(requestDTO);
        entity.setId(id);
        Mesa updatedEntity = mesaRepository.save(entity);
        return mesaMapper.toResponseDTO(updatedEntity);
    }

    @Override
    public void delete(Long id) {

        Mesa mesa = mesaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("La mesa que intenta eliminar no existe."));

        if (pedidosRepository.existsByMesaId(id)) {
            throw new BusinessException("No se puede eliminar la mesa número " + mesa.getNumeroMesa() + " porque tiene pedidos asociados.");
        }
        mesaRepository.deleteById(id);
    }
}
