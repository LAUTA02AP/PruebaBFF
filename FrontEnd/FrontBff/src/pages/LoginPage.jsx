import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/Services.js";
import "../styles/login.css";

function LoginPage() {
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // LOGIN contra el BFF
      // El BFF debería setear la cookie HttpOnly de sesión
      await loginUser(usuario, clave);

      // IMPORTANTE:
      // No guardamos nada sensible en localStorage.
      // Luego, HomePage y Sidebar usan getUserInfo() para saber rol, dni, etc.

      // De momento TODOS los roles van a /home
      navigate("/home");
    } catch (err) {
      console.error("Error en login:", err);

      if (err.response?.status === 401) {
        setError("Usuario o contraseña incorrectos");
      } else {
        setError("Ocurrió un error al iniciar sesión");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-logo">
            <span className="login-logo-icon">Logo</span>
          </div>

          <h1 className="login-title">Gestor</h1>
          <p className="login-subtitle">
            Iniciá sesión con tu usuario
          </p>

          <div className="input-group">
            <label className="input-labelLog">Usuario</label>
            <input
              type="text"
              placeholder="Ingresá tu usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
              className="login-input"
            />
          </div>

          <div className="input-group">
            <label className="input-labelLog">Contraseña</label>
            <input
              type="password"
              placeholder="Ingresá tu contraseña"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              required
              className="login-input"
            />
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? "Ingresando..." : "Ingresar"}
          </button>

          {error && <p className="login-error">{error}</p>}

          <p className="login-footnote">
            Acceso restringido · Uso interno
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
