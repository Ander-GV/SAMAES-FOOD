import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProductosPage } from '../pages/ProductosPage';
import api from '../services/api';
import * as AuthContext from '../context/AuthContext';

vi.mock('../services/api');
vi.mock('../context/AuthContext');

describe('ProductosPage - Filtrado por Pestañas de Activos e Inactivos', () => {
  const mockCategorias = [
    { id: 1, nombre: 'Platos Fuertes', estado: true }
  ];

  const mockProductos = [
    {
      id: 1,
      nombre: 'Hamburguesa Activa',
      descripcion: 'Plato disponible en carta',
      precio: 26000,
      categoria: { id: 1, nombre: 'Platos Fuertes' },
      categoriaId: 1,
      estadoDelProducto: { id: 1, nombre: 'Disponible' }
    },
    {
      id: 2,
      nombre: 'Hamburguesa Inactivada',
      descripcion: 'Plato retirado del menú',
      precio: 22000,
      categoria: { id: 1, nombre: 'Platos Fuertes' },
      categoriaId: 1,
      estadoDelProducto: { id: 3, nombre: 'Inactivo' }
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      isAdmin: () => true,
      user: { codigoEmpleado: 'ADM001', role: 'ADMINISTRADOR' }
    });

    api.get.mockImplementation((url) => {
      if (url === '/productos') return Promise.resolve({ data: mockProductos });
      if (url === '/categorias') return Promise.resolve({ data: mockCategorias });
      if (url === '/ingredientes') return Promise.resolve({ data: [] });
      if (url === '/ingredientes-productos') return Promise.resolve({ data: [] });
      if (url === '/unidades-medida') return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });
  });

  it('en la pestaña "Platos Activos en Carta" solo debe mostrar productos activos y NO mostrar los inactivos', async () => {
    render(<ProductosPage />);

    await waitFor(() => {
      expect(screen.getByText('Hamburguesa Activa')).toBeInTheDocument();
    });

    // En la vista de activos NO debe aparecer el inactivo
    expect(screen.queryByText('Hamburguesa Inactivada')).not.toBeInTheDocument();
  });

  it('al hacer clic en la pestaña "Platos Inactivos / Ocultos" debe mostrar exclusivamente los inactivos', async () => {
    render(<ProductosPage />);

    await waitFor(() => {
      expect(screen.getByText('Hamburguesa Activa')).toBeInTheDocument();
    });

    // Cambiar a la pestaña de inactivos
    const botonInactivos = screen.getByRole('button', { name: /Platos Inactivos \/ Ocultos/i });
    fireEvent.click(botonInactivos);

    await waitFor(() => {
      expect(screen.getByText('Hamburguesa Inactivada')).toBeInTheDocument();
    });

    // Ahora el plato activo ya no debe estar en esta pestaña
    expect(screen.queryByText('Hamburguesa Activa')).not.toBeInTheDocument();
  });
});
