import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/Services.js";
import "../styles/login.css";

function LoginPage() {
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    localStorage.clear();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // LOGIN en el BFF
      const data = await loginUser(usuario, clave);

      // Guardamos SOLO datos no sensibles
      localStorage.setItem("username", data.usuario);
      localStorage.setItem("rol", data.rol);

      // Evitar guardar null → causa NaN
      localStorage.setItem("dni", data.dni ?? "");
      localStorage.setItem("idVendedor", data.idVendedor ?? "");

      navigate("/home");

    } catch (err) {
      console.error("Error en login:", err);

      if (err.response?.status === 401) {
        setError("Usuario o contraseña incorrectos.");
      } else {
        setError("Ocurrió un error al iniciar sesión.");
      }

    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">

        <div className="login-header">
          <h1>Iniciar Sesión</h1>
          <p>Ingresa tus credenciales para continuar</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Usuario</label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="Ingresa tu usuario"
              required
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              placeholder="Ingresa tu contraseña"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-submit" disabled={isLoading}>
            {isLoading ? "Ingresando..." : "Iniciar Sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
