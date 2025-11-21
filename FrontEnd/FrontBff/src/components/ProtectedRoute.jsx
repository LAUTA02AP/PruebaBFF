import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getUserInfo } from "../api/Services";

function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    async function validarSesion() {
      try {
        //Consultar al BFF si hay usuario 
        const data = await getUserInfo();

        //Si responde OK → hay sesión válida
        setAuthorized(true);

      } catch (err) {
        //  Si falla (401), no hay login → bloquear
        setAuthorized(false);

        // limpiar marca local del front
        localStorage.removeItem("username");
        localStorage.removeItem("rol");
      } finally {
        setLoading(false);
      }
    }

    validarSesion();
  }, []);

  // Evita parpadeos mientras valida
  if (loading) return <div>Cargando...</div>;

  //  No autorizado → forzar login SIEMPRE
  if (!authorized) return <Navigate to="/" replace />;

  //  Autorizado → mostrar la ruta
  return children;
}

export default ProtectedRoute;


