// src/components/Header.jsx
import React, { useEffect, useState } from "react";
import { getUserInfo } from "../api/Services";
import "../styles/Componentes/Header.css";

function Header() {
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarUsuario() {
      try {
        const data = await getUserInfo();
        // Nombre del usuario que se loguea (no el nombre del cliente de la home)
        const nombre =
          data.username ||
          data.usuario ||
          data.nombre ||
          data.Nombre ||
          "";
        setUserName(nombre);
      } catch (err) {
        console.error("Error cargando usuario en Header:", err);
      } finally {
        setLoading(false);
      }
    }

    cargarUsuario();
  }, []);

  return (
    <header className="app-header">
      {/* Lado izquierdo: nombre de la empresa */}
      <div className="app-header-left">
        <span className="app-header-brand">Empresa</span>
      </div>

      {/* Lado derecho: usuario logueado */}
      <div className="app-header-right">
        {!loading && userName && (
          <span className="app-header-user">
            <span className="app-header-user-label">Usuario:</span>{" "}
            {userName}
          </span>
        )}
      </div>
    </header>
  );
}

export default Header;
