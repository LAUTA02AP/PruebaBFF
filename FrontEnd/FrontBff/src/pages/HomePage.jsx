import React, { useEffect, useState } from "react";
import {
  getUserInfo,
  getSaldoCliente,
  getClientesVendedor,
  logoutUser
} from "../api/Services";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

function HomePage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [nombre, setNombre] = useState("");
  const [saldo, setSaldo] = useState(0);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  
  // - Llama al BFF para limpiar la cookie HttpOnly (logout real)
  // - Limpia localStorage (UI)
  // - Redirige al login

  const cerrarSesion = async () => {
    try {
      await logoutUser();
      localStorage.clear();
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Error en logout:", err);
    }
  };


  // Cargar datos del usuario al entrar a Home
  // - Llama al BFF → obtiene username, rol, dni
  // - Según rol, carga saldo o lista de clientes
  //
  // NOTA: Ya NO guardamos DNI ni rol en localStorage,
  // todo viene del BFF y del state (user)
  // ----------------------------------------------------------
  useEffect(() => {
    async function cargar() {
      try {
        const data = await getUserInfo();
        setUser(data);

        // CLIENTE (ROL 0)
        if (data.rol === 0) {
          const saldoData = await getSaldoCliente(data.dni);
          setNombre(saldoData.nombre);
          setSaldo(Number(saldoData.saldo ?? 0));
        }

        // VENDEDOR (ROL 1)
        if (data.rol === 1) {
          const lista = await getClientesVendedor();
          setClientes(lista);
        }

      } catch (err) {
        console.error("Error cargando Home:", err);

        // Si GetUserInfo da 401 → cookie inválida → volver al login
        navigate("/", { replace: true });

      } finally {
        setLoading(false);
      }
    }

    cargar();
  }, []);

  if (loading || !user) return <p>Cargando...</p>;

  // ===============================================
  // CLIENTE (rol 0)
  // ===============================================
  if (user.rol === 0) {
    return (
      <div className="home-container">

        <section className="section1">
          <h2>
            Bienvenido <span className="cliente-nombre">{nombre}</span>
          </h2>

          <p className="saldo-principal">
            Tu saldo actual es:{" "}
            <span className="saldo-monto">${saldo.toFixed(2)}</span>
          </p>

          {/* Botón MIS PEDIDOS */}
          <button
            className="btn-ver-pedidos"
            onClick={() => navigate(`/pedidos/${user.dni}`)}
          >
            Ver mis pedidos
          </button>
        </section>

        <section className="section2">
          <h1>Sobre Nosotros</h1>
          <p>Información general...</p>
        </section>

        <button className="btn-logout" onClick={cerrarSesion}>
          Cerrar Sesión
        </button>
      </div>
    );
  }

  // ===============================================
  // VENDEDOR (rol 1)
  // ===============================================
  return (
    <div className="home-container">
      <h2>Bienvenido Vendedor: {user.username}</h2>
      <h3>Clientes asignados</h3>

      {clientes.length === 0 ? (
        <p>No tienes clientes asignados.</p>
      ) : (
        <table className="clientes-table-home">
          <thead>
            <tr>
              <th>DNI</th>
              <th>Nombre</th>
              <th>Saldo</th>
              <th>Acción</th>
            </tr>
          </thead>

          <tbody>
            {clientes.map((c) => (
              <tr key={c.dni}>
                <td>{c.dni}</td>
                <td>{c.nombre}</td>
                <td>${Number(c.saldo).toFixed(2)}</td>

                <td>
                  <button
                    className="btn-ver-pedidos"
                    onClick={() => navigate(`/pedidos/${c.dni}`)}
                  >
                    Ver pedidos
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button className="btn-logout" onClick={cerrarSesion}>
        Cerrar Sesión
      </button>
    </div>
  );
}

export default HomePage;
