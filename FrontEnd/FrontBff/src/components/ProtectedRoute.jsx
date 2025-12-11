// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getUserInfo } from "../api/Services";

function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [estaAutenticado, setEstaAutenticado] = useState(false);

  useEffect(() => {
    async function verificarSesion() {
      try {
        await getUserInfo(); // si responde OK, hay sesión
        setEstaAutenticado(true);
      } catch (err) {
        console.error("Error verificando sesión en ProtectedRoute:", err);
        setEstaAutenticado(false);
      } finally {
        setLoading(false);
      }
    }

    verificarSesion();
  }, []);

  if (loading) {
    return <p className="loading-text">Verificando sesión...</p>;
  }

  if (!estaAutenticado) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
