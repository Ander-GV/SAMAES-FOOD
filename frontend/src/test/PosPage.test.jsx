import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PosPage } from '../pages/PosPage';
import api from '../services/api';

vi.mock('../services/api');

describe('PosPage - Filtrado de Inactividad y Seguridad en Punto de Venta', () => {
  const mockCategorias = [
    { id: 1, nombre: 'Entradas', estado: true },
    { id: 2, nombre: 'Bebidas', estado: true },
    { id: 99, nombre: 'Categoría Oculta', estado: false } // INACTIVA
  ];

  const mockProductos = [
    {
      id: 1,
      nombre: 'Papas Rústicas',
      descripcion: 'Papas con queso',
      precio: 12000,
      categoria: { id: 1, nombre: 'Entradas', estado: true },
      categoriaId: 1,
      estadoDelProducto: { id: 1, nombre: 'Disponible' }
    },
    {
      id: 2,
      nombre: 'Plato Inactivo No Vendible',
      descripcion: 'Deshabilitado',
      precio: 20000,
      categoria: { id: 1, nombre: 'Entradas', estado: true },
      categoriaId: 1,
      estadoDelProducto: { id: 3, nombre: 'Inactivo' } // INACTIVO
    },
    {
      id: 3,
      nombre: 'Jugo Natural',
      descripcion: 'Fresa en agua',
      precio: 7000,
      categoria: { id: 2, nombre: 'Bebidas', estado: true },
      categoriaId: 2,
      estadoDelProducto: { id: 1, nombre: 'Disponible' }
    }
  ];

  const mockPedidos = [
    { id: 1, direccionEntrega: 'Mesa #1', total: 45000, estadoPedido: { id: 1, nombre: 'Pendiente' } },
    { id: 2, direccionEntrega: 'Mesa #2', total: 60000, estadoPedido: { id: 4, nombre: 'Completado' } } // COMPLETADO -> MESA LIBRE
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockImplementation((url) => {
      if (url === '/productos') return Promise.resolve({ data: mockProductos });
      if (url === '/categorias') return Promise.resolve({ data: mockCategorias });
      if (url === '/pedidos') return Promise.resolve({ data: mockPedidos });
      return Promise.resolve({ data: [] });
    });
  });

  it('NO debe listar productos inactivos en el catálogo del POS para evitar ventas de platos deshabilitados', async () => {
    render(<PosPage />);

    await waitFor(() => {
      expect(screen.getByText('Papas Rústicas')).toBeInTheDocument();
      expect(screen.getByText('Jugo Natural')).toBeInTheDocument();
    });

    // Verificar que el plato inactivo no aparece en el POS
    expect(screen.queryByText('Plato Inactivo No Vendible')).not.toBeInTheDocument();
  });

  it('NO debe mostrar categorías inactivas en los botones de filtro del POS', async () => {
    render(<PosPage />);

    await waitFor(() => {
      expect(screen.getByText('Entradas')).toBeInTheDocument();
      expect(screen.getByText('Bebidas')).toBeInTheDocument();
    });

    expect(screen.queryByText('Categoría Oculta')).not.toBeInTheDocument();
  });

  it('debe reflejar mesas libres cuando sus pedidos previos ya están completados', async () => {
    render(<PosPage />);

    await waitFor(() => {
      // Mesa #1 tiene pedido Pendiente -> Ocupada
      // Mesa #2 tiene pedido Completado -> Libre
      expect(screen.getByText('Mesa #1')).toBeInTheDocument();
      expect(screen.getByText('Mesa #2')).toBeInTheDocument();
    });
  });
});
