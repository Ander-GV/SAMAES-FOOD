
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PromocionesPage } from '../pages/PromocionesPage';
import api from '../services/api';
import * as AuthContext from '../context/AuthContext';

vi.mock('../services/api');
vi.mock('../context/AuthContext');

describe('PromocionesPage - Visualización y Filtrado de Promociones Activas vs Inactivas', () => {
  const mockPromociones = [
    {
      id: 1,
      nombre: 'Promo 15% Descuento',
      descripcion: 'Válido para pedidos online',
      tipoDescuento: 'PORCENTAJE',
      valor: 15,
      activa: true,
      codigoCupon: 'VERANO15',
      usosMaximos: 10,
      usosActuales: 2
    },
    {
      id: 2,
      nombre: 'Cupón Inactivo Caducado',
      descripcion: 'Promoción pasada',
      tipoDescuento: 'MONTO_FIJO',
      valor: 5000,
      activa: false, // INACTIVO
      codigoCupon: 'CADUCADO5K',
      usosMaximos: 5,
      usosActuales: 0
    },
    {
      id: 3,
      nombre: 'Cupón Flash Agotado',
      descripcion: 'Llegó al límite de usos',
      tipoDescuento: 'PORCENTAJE',
      valor: 20,
      activa: true,
      codigoCupon: 'FLASH20',
      usosMaximos: 5,
      usosActuales: 5 // AGOTADO
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      isAdmin: () => true,
      user: { codigoEmpleado: 'ADM001', role: 'ADMINISTRADOR' }
    });

    api.get.mockImplementation((url) => {
      if (url === '/promociones') return Promise.resolve({ data: mockPromociones });
      return Promise.resolve({ data: [] });
    });
  });

  it('debe etiquetar adecuadamente el estado Activo, Inactivo y Agotado en las tarjetas de promociones', async () => {
    render(<PromocionesPage />);

    await waitFor(() => {
      expect(screen.getByText('Promo 15% Descuento')).toBeInTheDocument();
      expect(screen.getByText('Cupón Inactivo Caducado')).toBeInTheDocument();
      expect(screen.getByText('Cupón Flash Agotado')).toBeInTheDocument();
    });

    // Validar insignias de estado
    expect(screen.getByText('Activo')).toBeInTheDocument();
    expect(screen.getByText('Inactivo')).toBeInTheDocument();
    expect(screen.getByText('Agotado')).toBeInTheDocument();
  });
});
