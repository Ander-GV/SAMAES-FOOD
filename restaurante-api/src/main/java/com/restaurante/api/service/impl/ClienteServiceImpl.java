package com.restaurante.api.service.impl;

import com.restaurante.api.dto.ClienteRequestDTO;
import com.restaurante.api.dto.ClienteResponseDTO;
import com.restaurante.api.entity.Cliente;
import com.restaurante.api.exception.BusinessException;
import com.restaurante.api.exception.ResourceNotFoundException;
import com.restaurante.api.mapper.ClienteMapper;
import com.restaurante.api.repository.ClienteRepository;
import com.restaurante.api.repository.PedidosRepository;
import com.restaurante.api.service.ClienteService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ClienteServiceImpl implements ClienteService {

    private final PedidosRepository pedidosRepository;
    private final ClienteRepository clienteRepository;
    private final ClienteMapper clienteMapper;

    public ClienteServiceImpl(ClienteRepository clienteRepository, ClienteMapper clienteMapper,
            PedidosRepository pedidosRepository) {
        this.clienteRepository = clienteRepository;
        this.clienteMapper = clienteMapper;
        this.pedidosRepository = pedidosRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClienteResponseDTO> findAll() {
        return clienteRepository.findAll().stream()
                .map(clienteMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ClienteResponseDTO findById(Long id) {
        return clienteRepository.findById(id)
                .map(clienteMapper::toResponseDTO)
                .orElseThrow(() -> new ResourceNotFoundException("El cliente solicitado no fue encontrado."));
    }

    @Override
    public ClienteResponseDTO save(ClienteRequestDTO requestDTO) {

        String nombre = requestDTO.getNombre().trim();
        String apellido = requestDTO.getApellido().trim();
        String telefono = requestDTO.getTelefono().trim();

        Cliente entity = clienteMapper.toEntity(requestDTO);
        entity.setNombre(nombre);
        entity.setApellido(apellido);
        entity.setTelefono(telefono);
        Cliente savedEntity = clienteRepository.save(entity);
        return clienteMapper.toResponseDTO(savedEntity);
    }

    @Override
    public ClienteResponseDTO update(Long id, ClienteRequestDTO requestDTO) {
        String nombre = requestDTO.getNombre().trim();
        String apellido = requestDTO.getApellido().trim();
        String telefono = requestDTO.getTelefono().trim();

        if (!clienteRepository.existsById(id)) {
            throw new ResourceNotFoundException("El cliente que intenta actualizar no existe.");
        }
        Cliente entity = clienteMapper.toEntity(requestDTO);
        entity.setId(id);
        entity.setNombre(nombre);
        entity.setApellido(apellido);
        entity.setTelefono(telefono);
        Cliente updatedEntity = clienteRepository.save(entity);
        return clienteMapper.toResponseDTO(updatedEntity);
    }

    @Override
    public void delete(Long id) {
        if (!clienteRepository.existsById(id)) {
            throw new ResourceNotFoundException("El cliente que intenta eliminar no existe.");
        }
        if (pedidosRepository.existsByClienteId(id)) {
            throw new BusinessException("No se puede eliminar el cliente porque tiene pedidos registrados a su nombre.");
        }
        clienteRepository.deleteById(id);
    }
}
