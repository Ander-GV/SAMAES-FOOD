import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UsuariosPage } from '../pages/UsuariosPage';
import api from '../services/api';
import * as AuthContext from '../context/AuthContext';

vi.mock('../services/api');
vi.mock('../context/AuthContext');

describe('UsuariosPage - Filtrado de Empleados/Usuarios y Búsqueda', () => {
  const mockRoles = [
    { id: 1, nombre: 'ADMINISTRADOR', descripcion: 'Admin total' },
    { id: 2, nombre: 'CAJERO', descripcion: 'Cajero' },
    { id: 3, nombre: 'MESERO', descripcion: 'Mesero' }
  ];

  const mockEmpleados = [
    {
      id: 1,
      nombre: 'Carlos',
      apellido: 'Pérez',
      email: 'carlos@restaurante.com',
      telefono: '3111111111',
      documento: '101',
      cargo: 'CAJERO',
      activo: true
    },
    {
      id: 2,
      nombre: 'María',
      apellido: 'Gómez',
      email: 'maria@restaurante.com',
      telefono: '3222222222',
      documento: '102',
      cargo: 'MESERO',
      activo: true
    }
  ];

  const mockUsuarios = [
    {
      id: 10,
      codigoEmpleado: 'CAJ-101',
      roles: { id: 2, nombre: 'CAJERO' },
      empleados: mockEmpleados[0]
    },
    {
      id: 20,
      codigoEmpleado: 'MES-102',
      roles: { id: 3, nombre: 'MESERO' },
      empleados: mockEmpleados[1]
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      isAdmin: () => true,
      user: { codigoEmpleado: 'ADM001', role: 'ADMINISTRADOR' }
    });

    api.get.mockImplementation((url) => {
      if (url === '/usuarios') return Promise.resolve({ data: mockUsuarios });
      if (url === '/empleados') return Promise.resolve({ data: mockEmpleados });
      if (url === '/roles') return Promise.resolve({ data: mockRoles });
      return Promise.resolve({ data: [] });
    });
  });

  it('debe renderizar la lista consolidada de personal sin duplicados y con sus respectivos roles', async () => {
    render(<UsuariosPage />);

    await waitFor(() => {
      expect(screen.getByText('Carlos Pérez')).toBeInTheDocument();
      expect(screen.getByText('María Gómez')).toBeInTheDocument();
      expect(screen.getByText('CAJ-101')).toBeInTheDocument();
      expect(screen.getByText('MES-102')).toBeInTheDocument();
    });
  });

  it('debe filtrar correctamente por búsqueda de texto excluyendo elementos no coincidentes', async () => {
    render(<UsuariosPage />);

    await waitFor(() => {
      expect(screen.getByText('Carlos Pérez')).toBeInTheDocument();
      expect(screen.getByText('María Gómez')).toBeInTheDocument();
    });

    const inputBusqueda = screen.getByPlaceholderText(/Buscar por nombre, teléfono, rol o código.../i);
    fireEvent.change(inputBusqueda, { target: { value: 'Carlos' } });

    await waitFor(() => {
      expect(screen.getByText('Carlos Pérez')).toBeInTheDocument();
      expect(screen.queryByText('María Gómez')).not.toBeInTheDocument();
    });
  });
});
