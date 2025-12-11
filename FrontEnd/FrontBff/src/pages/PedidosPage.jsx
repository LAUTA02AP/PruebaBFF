// src/pages/PedidosPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getPedidosPorDni,
  getClientePorDni,
  getUserInfo,
} from "../api/Services";
import BotonVolver from "../components/common/BotonVolver";
import BotonDescargar from "../components/common/BotonDescarga";
import { useTableControls } from "../hooks/useTableControls";

import "../styles/Generales/pages.css";
import "../styles/Generales/Table.css";

function PedidosPage() {
  const [pedidos, setPedidos] = useState([]);
  const [clienteNombre, setClienteNombre] = useState("");
  const [dniMostrar, setDniMostrar] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const { dni } = useParams(); // solo viene para vendedor: /pedidos/:dni
  const navigate = useNavigate();

  // ==============================
  // BÚSQUEDA + PAGINACIÓN (hook)
  // ⚠️ IMPORTANTE: SIEMPRE va antes de cualquier return
  // ==============================
  const table = useTableControls(pedidos, {
    pageSizeDefault: 10,
    filterFn: (item, term) => {
      const id = String(item.Id ?? item.id ?? "").toLowerCase();
      const fecha = String(item.Fecha ?? item.fecha ?? "").toLowerCase();
      const total = String(item.Total ?? item.total ?? "").toLowerCase();

      return (
        id.includes(term) ||
        fecha.includes(term) ||
        total.includes(term)
      );
    },
  });

  useEffect(() => {
    async function cargar() {
      try {
        // 1) Usuario logueado desde el BFF
        const dataUser = await getUserInfo(); // { rol, dni, username, ... }
        setUser(dataUser);

        const rol = dataUser.rol;
        const dniSesion = dataUser.dni;

        // 2) DNI para buscar pedidos
        let dniFinal = "";

        if (rol === 0) {
          // Cliente → su propio DNI
          dniFinal = dniSesion || "";
        } else {
          // Vendedor / otros → DNI de la URL
          dniFinal = dni || "";
        }

        if (!dniFinal) {
          throw new Error("DNI no encontrado para cargar pedidos");
        }

        setDniMostrar(dniFinal);

        // 3) Pedidos por DNI
        const pedidosData = await getPedidosPorDni(dniFinal);
        setPedidos(Array.isArray(pedidosData) ? pedidosData : []);

        // 4) Nombre a mostrar
        if (rol === 0) {
          const nombre =
            dataUser.username ||
            dataUser.nombre ||
            dataUser.Nombre ||
            "Cliente";
          setClienteNombre(nombre);
        } else {
          const cliente = await getClientePorDni(dniFinal);
          const nombreCliente =
            cliente.nombre || cliente.Nombre || "Cliente";
          setClienteNombre(nombreCliente);
        }
      } catch (err) {
        console.error("Error cargando pedidos:", err);
        if (err.response?.status === 401) {
          navigate("/", { replace: true });
        }
      } finally {
        setLoading(false);
      }
    }

    cargar();
  }, [dni, navigate]);

  // Mientras carga info de usuario / pedidos
  if (loading || !user) {
    return <p className="pedidos-loading">Cargando pedidos...</p>;
  }

  const esCliente = user.rol === 0;

  const noHayPedidos = pedidos.length === 0;
  const noHayResultadosConFiltro =
    !noHayPedidos && table.totalItems === 0;

  return (
    <div className="table-page-wrapper">
      {/* Cabecera general de la página de tabla */}
      <div className="table-page-header">
        <div className="table-page-header-left">
          <BotonVolver visible={true} />

          <div>
            <h2 className="table-page-title">
              {esCliente ? "Mis pedidos" : `Pedidos de ${clienteNombre}`}
            </h2>

            <div className="table-page-subtitle">
              {esCliente
                ? `DNI: ${dniMostrar}`
                : `DNI cliente: ${dniMostrar}`}
            </div>
          </div>
        </div>
      </div>

      {/* Estado: sin ningún pedido */}
      {noHayPedidos ? (
        <p className="pedidos-vacio">No hay pedidos registrados.</p>
      ) : (
        <div className="table-card">
          {/* TOOLBAR */}
          <div className="table-toolbar">
            <div className="table-toolbar-left">
              <div className="table-search-wrapper">
                <input
                  type="text"
                  className="table-search-input"
                  placeholder="Buscar pedido (ID, fecha, total)..."
                  value={table.search}
                  onChange={(e) => table.setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="table-toolbar-right">
              <span className="table-count">
                {noHayResultadosConFiltro ? (
                  "No se encontraron resultados"
                ) : (
                  <>
                    Mostrando {table.startIndex + 1}-{table.endIndex} de{" "}
                    {table.totalItems}
                  </>
                )}
              </span>

              <BotonDescargar label="Descargar" />
            </div>
          </div>

          {/* TABLA */}
          {!noHayResultadosConFiltro && (
            <>
              <div className="table-wrapper">
                <table className="table pedidos-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Fecha</th>
                      <th className="text-right">Total</th>
                      <th className="text-center">Acción</th>
                    </tr>
                  </thead>

                  <tbody>
                    {table.dataPage.map((p) => {
                      const id = p.Id ?? p.id;
                      const fecha = p.Fecha ?? p.fecha;
                      const total = p.Total ?? p.total;

                      return (
                        <tr key={id}>
                          <td>{id}</td>
                          <td>
                            {fecha
                              ? new Date(fecha).toLocaleDateString("es-AR")
                              : "-"}
                          </td>
                          <td className="text-right">
                            ${Number(total ?? 0).toFixed(2)}
                          </td>

                          <td className="table-actions text-center">
                            <button
                              className="btn-table btn-table-primary"
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
              </div>

              {/* PAGINACIÓN */}
              <div className="table-pagination">
                <button
                  className="table-pagination-button"
                  onClick={table.prevPage}
                  disabled={table.currentPage === 1}
                >
                  Anterior
                </button>

                <span className="table-pagination-info">
                  Página {table.currentPage} de {table.totalPages}
                </span>

                <button
                  className="table-pagination-button"
                  onClick={table.nextPage}
                  disabled={table.currentPage === table.totalPages}
                >
                  Siguiente
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default PedidosPage;
