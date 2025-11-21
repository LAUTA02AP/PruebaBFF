import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPedidosPorDni, getClientePorDni } from "../api/Services";
import BotonVolver from "../components/BotonVolver";
import "../styles/Pedidos.css";

function PedidosPage() {
  const [pedidos, setPedidos] = useState([]);
  const [clienteNombre, setClienteNombre] = useState("");
  const [dniMostrar, setDniMostrar] = useState("");
  const [loading, setLoading] = useState(true);

  const { dni } = useParams();
  const navigate = useNavigate();

  // datos de sesión
  const rol = Number(localStorage.getItem("rol"));
  const dniSesion = localStorage.getItem("dni") || "";   // ✔ FIX importante

  useEffect(() => {
    async function cargar() {
      try {
        let dniFinal;

        if (rol === 0) {
          // ✔ Cliente → siempre su DNI
          dniFinal = dniSesion || "";
        } else {
          // ✔ Vendedor → usa el DNI de la URL
          dniFinal = dni || "";
        }

        if (!dniFinal) throw new Error("DNI no encontrado");

        setDniMostrar(dniFinal);

        // Cargar pedidos del BFF
        const pedidosData = await getPedidosPorDni(dniFinal);
        setPedidos(Array.isArray(pedidosData) ? pedidosData : []);

        // Si es vendedor → buscar nombre del cliente seleccionado
        if (rol !== 0 && dni) {
          const cliente = await getClientePorDni(dni);
          setClienteNombre(cliente.nombre || cliente.Nombre || "Cliente");
        }

      } catch (err) {
        console.error("Error cargando pedidos:", err);
      } finally {
        setLoading(false);
      }
    }

    cargar();
  }, [dni, rol, dniSesion]);

  if (loading) return <p className="pedidos-loading">Cargando pedidos...</p>;

  return (
    <div className="pedidos-wrapper">

      <div className="pedidos-header">
        <BotonVolver visible={true} />

        <h2 className="pedidos-title">
          {rol === 0
            ? `Mis pedidos (DNI: ${dniMostrar})`
            : `Pedidos de ${clienteNombre} (DNI: ${dni})`}
        </h2>
      </div>

      {pedidos.length === 0 ? (
        <p className="pedidos-vacio">No hay pedidos registrados.</p>
      ) : (
        <table className="pedidos-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Acción</th>
            </tr>
          </thead>

          <tbody>
            {pedidos.map((p) => {
              const id = p.Id ?? p.id;
              const fecha = p.Fecha ?? p.fecha;
              const total = p.Total ?? p.total;

              return (
                <tr key={id}>
                  <td>{id}</td>
                  <td>{new Date(fecha).toLocaleDateString("es-AR")}</td>
                  <td>${Number(total).toFixed(2)}</td>

                  <td>
                    <button
                      className="btn-ver"
                      onClick={() => navigate(`/detalle/${id}`)}
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default PedidosPage;
