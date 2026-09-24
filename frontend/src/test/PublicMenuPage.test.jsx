import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PublicMenuPage } from '../pages/PublicMenuPage';
import api from '../services/api';

vi.mock('../services/api');

describe('PublicMenuPage - Filtrado de Elementos Inactivos en Menú Público', () => {
  const mockCategorias = [
    { id: 1, nombre: 'Platos Fuertes', estado: true },
    { id: 2, nombre: 'Bebidas', estado: true },
    { id: 3, nombre: 'Categoría Deshabilitada', estado: false } // INACTIVA
  ];

  const mockProductos = [
    {
      id: 101,
      nombre: 'Hamburguesa SAMAES Clásica',
      descripcion: 'Deliciosa hamburguesa artesanal',
      precio: 25000,
      categoria: { id: 1, nombre: 'Platos Fuertes', estado: true },
      categoriaId: 1,
      estadoDelProducto: { id: 1, nombre: 'Disponible' } // ACTIVO
    },
    {
      id: 102,
      nombre: 'Producto Inactivo Soft-Deleted',
      descripcion: 'No debe aparecer en el menú',
      precio: 18000,
      categoria: { id: 1, nombre: 'Platos Fuertes', estado: true },
      categoriaId: 1,
      estadoDelProducto: { id: 3, nombre: 'Inactivo' } // INACTIVO
    },
    {
      id: 103,
      nombre: 'Plato de Categoría Inactiva',
      descripcion: 'Categoría apagada',
      precio: 30000,
      categoria: { id: 3, nombre: 'Categoría Deshabilitada', estado: false }, // CAT INACTIVA
      categoriaId: 3,
      estadoDelProducto: { id: 1, nombre: 'Disponible' }
    },
    {
      id: 104,
      nombre: 'Limonada de Coco',
      descripcion: 'Bebida refrescante',
      precio: 8000,
      categoria: { id: 2, nombre: 'Bebidas', estado: true },
      categoriaId: 2,
      estadoDelProducto: { id: 1, nombre: 'Disponible' } // ACTIVO
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockImplementation((url) => {
      if (url === '/productos') {
        return Promise.resolve({ data: mockProductos });
      }
      if (url === '/categorias') {
        return Promise.resolve({ data: mockCategorias });
      }
      return Promise.resolve({ data: [] });
    });
  });

  it('NO debe mostrar productos con estado Inactivo ni productos pertenecientes a categorías inactivas', async () => {
    render(<PublicMenuPage />);

    await waitFor(() => {
      expect(screen.getByText('Hamburguesa SAMAES Clásica')).toBeInTheDocument();
      expect(screen.getByText('Limonada de Coco')).toBeInTheDocument();
    });

    // 1. Verificar que el producto inactivo NO se renderiza en la vista
    expect(screen.queryByText('Producto Inactivo Soft-Deleted')).not.toBeInTheDocument();

    // 2. Verificar que el producto cuya categoría está inactiva NO se renderiza
    expect(screen.queryByText('Plato de Categoría Inactiva')).not.toBeInTheDocument();
  });

  it('NO debe mostrar pestañas de categorías que tengan estado inactivo (estado === false)', async () => {
    render(<PublicMenuPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Platos Fuertes' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Bebidas' })).toBeInTheDocument();
    });

    // La categoría inactiva no debe tener pestaña
    expect(screen.queryByRole('button', { name: 'Categoría Deshabilitada' })).not.toBeInTheDocument();
  });
});
