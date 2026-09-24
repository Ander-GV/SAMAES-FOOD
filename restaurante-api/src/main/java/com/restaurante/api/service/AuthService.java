package com.restaurante.api.service;

import com.restaurante.api.dto.AuthRequestDTO;
import com.restaurante.api.dto.AuthResponseDTO;

public interface AuthService {
    AuthResponseDTO login(AuthRequestDTO authRequestDTO);
}
