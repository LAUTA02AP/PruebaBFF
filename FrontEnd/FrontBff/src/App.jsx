import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import DetallePage from "./pages/DetallePage";
import PedidosPage from "./pages/pedidosPage";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login */}
        <Route path="/" element={<LoginPage />} />

        {/* Home */}
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

        {/* Mis pedidos (cliente rol 0) */}
        <Route
          path="/pedidos"
          element={
            <ProtectedRoute>
              <PedidosPage />
            </ProtectedRoute>
          }
        />

        {/* Detalle */}
        <Route
          path="/detalle/:idPedido"
          element={
            <ProtectedRoute>
              <DetallePage />
            </ProtectedRoute>
          }
        />

        {/* fallback */}
        <Route path="*" element={<LoginPage />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
