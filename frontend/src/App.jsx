import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { PublicMenuPage } from './pages/PublicMenuPage';
import { LoginPage } from './pages/LoginPage';
import { PosPage } from './pages/PosPage';
import { PedidosPage } from './pages/PedidosPage';
import { ProductosPage } from './pages/ProductosPage';
import { CategoriasPage } from './pages/CategoriasPage';
import { InventarioPage } from './pages/InventarioPage';
import { ProveedoresPage } from './pages/ProveedoresPage';
import { UnidadesMedidaPage } from './pages/UnidadesMedidaPage';
import { MovimientosInventarioPage } from './pages/MovimientosInventarioPage';
import { UsuariosPage } from './pages/UsuariosPage';
import { PromocionesPage } from './pages/PromocionesPage';
import { MesasPage } from './pages/MesasPage';
import { ReportesPage } from './pages/ReportesPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin()) return <Navigate to="/pos" replace />;
  return children;
};

export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <div style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/menu" element={<PublicMenuPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route 
                path="/pos" 
                element={
                  <ProtectedRoute>
                    <PosPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/pedidos" 
                element={
                  <ProtectedRoute>
                    <PedidosPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/productos" 
                element={
                  <AdminRoute>
                    <ProductosPage />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/categorias" 
                element={
                  <AdminRoute>
                    <CategoriasPage />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/mesas" 
                element={
                  <AdminRoute>
                    <MesasPage />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/promociones" 
                element={
                  <AdminRoute>
                    <PromocionesPage />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/inventario" 
                element={
                  <AdminRoute>
                    <InventarioPage />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/movimientos" 
                element={
                  <AdminRoute>
                    <MovimientosInventarioPage />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/unidades" 
                element={
                  <AdminRoute>
                    <UnidadesMedidaPage />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/proveedores" 
                element={
                  <AdminRoute>
                    <ProveedoresPage />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/usuarios" 
                element={
                  <AdminRoute>
                    <UsuariosPage />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/reportes" 
                element={
                  <AdminRoute>
                    <ReportesPage />
                  </AdminRoute>
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
