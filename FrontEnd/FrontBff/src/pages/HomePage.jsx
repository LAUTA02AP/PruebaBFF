import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUserInfo,
  getSaldoCliente,
  getClientesVendedor
} from "../api/Services"; // mismo servicio que usabas en el BFF
import "../styles/Generales/pages.css"; // mismo CSS que el Home viejo
import "../styles/Generales/Table.css"; 
function HomePage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [nombre, setNombre] = useState("");
  const [saldo, setSaldo] = useState(0);
  const [totalPedidos, setTotalPedidos] = useState(0);
  const [totalCobros, setTotalCobros] = useState(0);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargar() {
      try {
        // Traemos info del usuario desde el BFF (cookie de sesión)
        const data = await getUserInfo();
        setUser(data);

        // CLIENTE (ROL 0)
        if (data.rol === 0) {
          const saldoData = await getSaldoCliente(data.dni);

          const totalPed = Number(saldoData.totalPedidos ?? 0);
          const totalCob = Number(saldoData.totalCobros ?? 0);
          const saldoCalculado = Number(
            saldoData.saldo ?? (totalPed - totalCob)
          );

          setNombre(saldoData.nombre ?? data.username ?? "Cliente");
          setTotalPedidos(totalPed);
          setTotalCobros(totalCob);
          setSaldo(saldoCalculado);
        }

        // VENDEDOR (ROL 1)
        if (data.rol === 1) {
          const lista = await getClientesVendedor();
          setClientes(lista);
        }
      } catch (err) {
        console.error("Error cargando Home:", err);
        // Si no hay sesión/cookie → volvemos al login
        navigate("/", { replace: true });
      } finally {
        setLoading(false);
      }
    }

    cargar();
  }, [navigate]);

  if (loading) {
    return <p className="loading-text">Cargando...</p>;
  }

  if (!user) {
    return null;
  }

  // ============================
  // CLIENTE (rol 0)
  // ============================
  if (user.rol === 0) {
    return (
      <div>
        <section className="section1">
          <h2>
            Bienvenido, <span className="cliente-nombre">{nombre}</span>
            <br />
            Tu saldo total de pedidos es:{" "}
            <span className="saldo-monto">${saldo.toFixed(2)}</span>
          </h2>

          <p className="saldo-detalle">
            <strong>Total de pedidos:</strong> ${totalPedidos.toFixed(2)} <br />
            <strong>Total abonado:</strong> ${totalCobros.toFixed(2)}
          </p>
        </section>

        <section className="section2">
          <h1>Sobre Nosotros</h1>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat.
          </p>
        </section>

        <section className="section3">
          <h2>DESTACADOS</h2>
          <p>Productos en oferta - Aprovechá nuestras mejores promociones</p>
        </section>

        <section className="Contacto">
          <h2>Contacto</h2>
          <p>📞 Teléfono: +54 9 351 123-4567</p>
          <p>✉️ Email: contacto@ejemplo.com</p>
        </section>
      </div>
    );
  }

  // ============================
  // VENDEDOR (rol 1)
  // ============================
  // ============================
// VENDEDOR (rol 1)
// ============================
return (
  <div>
    <section className="section1">
      <h2>
        Bienvenido,{" "}
        <span className="cliente-nombre">{user.username}</span>
      </h2>
      <p className="saldo-detalle">
        Aquí podés ver el listado de tus clientes y acceder a sus pedidos.
      </p>
    </section>

    <section className="section2">
      <h1>Clientes asignados</h1>

      {clientes.length === 0 ? (
        <p>No tienes clientes asignados.</p>
      ) : (
        // 👉 CARD de tabla reutilizando Table.css
        <div className="table-card">
          <div className="table-wrapper">
            <table className="table clientes-table">
              <thead>
                <tr>
                  <th>DNI</th>
                  <th>Nombre</th>
                  <th className="text-right">Saldo</th>
                  <th className="text-center">Acción</th>
                </tr>
              </thead>

              <tbody>
                {clientes.map((c) => (
                  <tr key={c.dni}>
                    <td>{c.dni}</td>
                    <td>{c.nombre}</td>
                    <td className="text-right">
                      ${Number(c.saldo ?? 0).toFixed(2)}
                    </td>
                    <td className="table-actions text-center">
                      <button
                        className="btn-table btn-table-primary"
                        onClick={() => navigate(`/pedidos/${c.dni}`)}
                      >
                        Ver pedidos
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  </div>
);

}

export default HomePage;
