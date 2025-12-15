// src/components/Sidebar.jsx
import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { getUserInfo, logoutUser } from "../api/Services";
import "../styles/Componentes/sidebar.css";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // No mostramos sidebar en login
  if (location.pathname === "/") {
    return null;
  }

  useEffect(() => {
    let isMounted = true;

    async function cargarUsuario() {
      try {
        const data = await getUserInfo(); // BFF -> { rol, username, dni, ... }
        if (isMounted) setUser(data);
      } catch (err) {
        console.error("Error cargando usuario en Sidebar:", err);
        navigate("/", { replace: true });
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    cargarUsuario();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error("Error en logout:", err);
    } finally {
      localStorage.clear();
      navigate("/", { replace: true });
    }
  };

  if (loading || !user) return null;

  const rol = user.rol;
  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Botón hamburguesa para móvil */}
      <button
      type="button"
        className="mobile-menu-btn"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        ☰
      </button>

      <nav className={`modern-nav ${isMobileOpen ? "mobile-open" : ""}`}>
        <ul className="nav-list">
          <div className="nav-items-left">
            <div className="nav-header">
            <div className="nav-logo-circle">E</div>   {/* Podés cambiar la letra */}
            <span className="nav-title">Titulo</span>  {/* O el nombre real */}
                  </div>


            {/* ============ CLIENTE (rol 0) ============ */}
            {rol === 0 && (
              <>
                <li className="nav-item">
                  <NavLink
                    to="/home"
                    className={`nav-link ${
                      isActive("/home") ? "active" : ""
                    }`}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    🏠 Inicio
                  </NavLink>
                </li>

                <li className="nav-item">
                  {/* Mismo diseño, pero sin navegación real */}
                  <button
                    className="nav-link"
                    onClick={(e) => e.preventDefault()}
                    type="button"
                  >
                    Cta Cte (próximamente)
                  </button>
                </li>

                <li className="nav-item">
                  <NavLink
                    to="/pedidos"
                    className={`nav-link ${
                      isActive("/pedidos") ? "active" : ""
                    }`}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    📋 Pedidos
                  </NavLink>
                </li>

                <li className="nav-item">
                  <button
                    className="nav-link"
                    onClick={(e) => e.preventDefault()}
                    type="button"
                  >
                    Historial (desarrollo)
                  </button>
                </li>

                <li className="nav-item">
                  <button
                    className="nav-link"
                    onClick={(e) => e.preventDefault()}
                    type="button"
                  >
                    💳 Pagar (próximamente)
                  </button>
                </li>
              </>
            )}

            {/* ============ VENDEDOR (rol 1) ============ */}
            {rol === 1 && (
              <>
                <li className="nav-item">
                  <NavLink
                    to="/home"
                    className={`nav-link ${
                      isActive("/home") ? "active" : ""
                    }`}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    🏠 Inicio
                  </NavLink>
                </li>

                <li className="nav-item">
                  <button
                    className="nav-link"
                    onClick={(e) => e.preventDefault()}
                    type="button"
                  >
                    👥 Clientes (próximamente)
                  </button>
                </li>

                <li className="nav-item">
                  <button
                    className="nav-link"
                    onClick={(e) => e.preventDefault()}
                    type="button"
                  >
                    📋 Pedidos clientes
                  </button>
                </li>

                <li className="nav-item">
                  <button
                    className="nav-link"
                    onClick={(e) => e.preventDefault()}
                    type="button"
                  >
                    📊 Estadísticas (próximamente)
                  </button>
                </li>
              </>
            )}
          </div>

          <li className="nav-item nav-logout">
            <button onClick={handleLogout} className="logout-btn">
            Cerrar sesión
            </button>
          </li>
        </ul>
      </nav>

      {/* Overlay para cerrar en móvil */}
      {isMobileOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}

export default Sidebar;
