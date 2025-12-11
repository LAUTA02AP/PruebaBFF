// src/App.jsx
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import DetallePage from "./pages/DetallePage";
import PedidosPage from "./pages/PedidosPage";

 
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";



// Layout principal: decide si muestra o no el sidebar
function AppContent() {
  const location = useLocation();
  const isLogin = location.pathname === "/"; // ruta de login

  const routes = (
    <Routes>
      {/* LOGIN (pública) */}
      <Route path="/" element={<LoginPage />} />

      {/* HOME */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />

      {/* Pedidos por DNI (vendedor) */}
      <Route
        path="/pedidos/:dni"
        element={
          <ProtectedRoute>
            <PedidosPage />
          </ProtectedRoute>
        }
      />

      {/* Mis pedidos (cliente) */}
      <Route
        path="/pedidos"
        element={
          <ProtectedRoute>
            <PedidosPage />
          </ProtectedRoute>
        }
      />

      {/* Detalle de pedido */}
      <Route
        path="/detalle/:idPedido"
        element={
          <ProtectedRoute>
            <DetallePage />
          </ProtectedRoute>
        }
      />

      {/* Fallback: cualquier ruta desconocida → login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );

  // Login: SIN sidebar ni header
  if (isLogin) {
    return <div className="page-without-sidebar">{routes}</div>;
  }

  // Resto de la app: CON sidebar + header + contenido
  return (
    <div className="app-with-sidebar">
      {/* Menú lateral */}
      <Sidebar />

      {/* Contenido principal desplazado por el sidebar */}
      <div className="main-content-with-sidebar">
        {/* Header superior con nombre de empresa y usuario */}
        <Header />

        {/* Rutas de la app */}
        {routes}
      </div>
    </div>
  );
}

// Router raíz
function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
