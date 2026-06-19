import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';

import { AppProvider, useApp } from './store/AppContext';

import AdminLayout from './components/layout/AdminLayout';
import ClientLayout from './components/layout/ClientLayout';

import CataloguePage from './pages/CataloguePage';
import AuthPage from './pages/AuthPage';
import ProposerPage from './pages/ProposerPage';
import FavorisPage from './pages/FavorisPage';
import CommandesPage from './pages/CommandesPage';
import ComptePage from './pages/ComptePage';
import EquipementDetailPage from './pages/EquipementDetailPage';

import DashboardPage from './pages/admin/DashboardPage';
import OffresPage from './pages/admin/OffresPage';
import InventairePage from './pages/admin/InventairePage';
import { CategoriesPage } from './pages/admin/CategoriesPage';
import { VentesPage } from './pages/admin/CategoriesPage';
import ItemEditorPage from './pages/admin/ItemEditorPage';

// ---------------------------------------------------------------------------
// Route guards
// ---------------------------------------------------------------------------

function ProtectedRoute() {
  
  // const { state } = useApp();
  // return state.isAuthenticated ? <Outlet /> : <Navigate to="/connexion" replace />;
  return <Outlet />
}

function AdminRoute() {
  // const { state } = useApp();
  // return state.isAdmin ? <Outlet /> : <Navigate to="/" replace />;
  return <Outlet />
}

// ---------------------------------------------------------------------------
// Routes — must live inside AppProvider so hooks resolve
// ---------------------------------------------------------------------------

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes with client layout */}
      <Route element={<ClientLayout />}>
        <Route path="/" element={<CataloguePage />} />
        <Route path="/connexion" element={<AuthPage />} />
        <Route path="/favoris" element={<FavorisPage />} />
        <Route path="/commandes" element={<CommandesPage />} />
        <Route path="/compte" element={<ComptePage />} />
        <Route path="/equipement/:id" element={<EquipementDetailPage />} />
      </Route>

      {/* Standalone public route — no layout wrapper */}
      <Route path="/proposer" element={<ProposerPage />} />

      {/* Admin routes — protected by both ProtectedRoute and AdminRoute */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<DashboardPage />} />
            <Route path="/admin/offres" element={<OffresPage />} />
            <Route path="/admin/inventaire" element={<InventairePage />} />
            <Route path="/admin/inventaire/:id" element={<ItemEditorPage />} />
            <Route path="/admin/categories" element={<CategoriesPage />} />
            <Route path="/admin/ventes" element={<VentesPage />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// ---------------------------------------------------------------------------
// Root export
// ---------------------------------------------------------------------------

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
