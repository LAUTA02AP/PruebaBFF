// src/pages/PedidosPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPedidosPorDni, getClientePorDni, getUserInfo } from "../api/Services";

import BotonVolver from "../components/common/BotonVolver";
import BotonDescargar from "../components/common/BotonDescarga";

import DataTable from "../components/DataTable";

import "../styles/Generales/pages.css";

function PedidosPage() {
  const [pedidos, setPedidos] = useState([]);
  const [clienteNombre, setClienteNombre] = useState("");
  const [dniMostrar, setDniMostrar] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const { dni } = useParams();
  const navigate = useNavigate();

  //aca s eutiliza la creacion de la tabla,con la libreria de react se puede crear las tablas th tr atraves de  un array 
  const columns = useMemo(
    () => [
      {
        id: "id",
        header: "ID",
        accessorFn: (row) => row.Id ?? row.id ?? "",
        cell: (info) => info.getValue(),
      },
      {
        id: "fecha",
        header: "Fecha",
        accessorFn: (row) => row.Fecha ?? row.fecha ?? null,
        cell: (info) => {
          const fecha = info.getValue();
          return fecha ? new Date(fecha).toLocaleDateString("es-AR") : "-";
        },
      },
      {
        id: "total",
        header: "Total",
        accessorFn: (row) => row.Total ?? row.total ?? 0,
        cell: (info) => `$${Number(info.getValue() ?? 0).toFixed(2)}`,
        meta: { className: "text-right" },
      },
      {
        id: "accion",
        header: "Acción",
        cell: ({ row }) => {
          const original = row.original;
          const id = original.Id ?? original.id;

          return (
            <div className="table-actions text-center">
              <button
                className="btn-table btn-table-primary"
                onClick={() => navigate(`/detalle/${id}`)}
              >
                Ver detalle
              </button>
            </div>
          );
        },
        meta: { className: "text-center" },
      },
    ],
    [navigate]
  );

  useEffect(() => {
    async function cargar() {
      try {
        const dataUser = await getUserInfo();
        setUser(dataUser);

        const rol = dataUser.rol;
        const dniSesion = dataUser.dni;

        let dniFinal = "";
        if (rol === 0) dniFinal = dniSesion || "";
        else dniFinal = dni || "";

        if (!dniFinal) throw new Error("DNI no encontrado para cargar pedidos");

        setDniMostrar(dniFinal);

        const pedidosData = await getPedidosPorDni(dniFinal);
        setPedidos(Array.isArray(pedidosData) ? pedidosData : []);

        if (rol === 0) {
          const nombre =
            dataUser.username || dataUser.nombre || dataUser.Nombre || "Cliente";
          setClienteNombre(nombre);
        } else {
          const cliente = await getClientePorDni(dniFinal);
          const nombreCliente = cliente.nombre || cliente.Nombre || "Cliente";
          setClienteNombre(nombreCliente);
        }
      } catch (err) {
        console.error("Error cargando pedidos:", err);
        if (err.response?.status === 401) navigate("/", { replace: true });
      } finally {
        setLoading(false);
      }
    }

    cargar();
  }, [dni, navigate]);

  if (loading || !user) {
    return <p className="pedidos-loading">Cargando pedidos...</p>;
  }

  const esCliente = user.rol === 0;
  const noHayPedidos = pedidos.length === 0;

  return (
    <div className="table-page-wrapper">
      <div className="table-page-header">
        <div className="table-page-header-left">
          <BotonVolver visible={true} />

          <div>
            <h2 className="table-page-title">
              {esCliente ? "Mis pedidos" : `Pedidos de ${clienteNombre}`}
            </h2>

            <div className="table-page-subtitle">
              {esCliente ? `DNI: ${dniMostrar}` : `DNI cliente: ${dniMostrar}`}
            </div>
          </div>
        </div>
      </div>

      {noHayPedidos ? (
        <p className="pedidos-vacio">No hay pedidos registrados.</p>
      ) : (
        <DataTable
          data={pedidos}
          columns={columns}
          pageSizeDefault={10}
          searchPlaceholder="Buscar pedido (ID, fecha, total)..."
          renderToolbarRight={<BotonDescargar label="Descargar" />}
          // Si querés que "pedidos-table" aplique al <table>,
          // te recomiendo agregar tableClassName en DataTable (te lo paso si querés).
          className=""
        />
      )}
    </div>
  );
}

export default PedidosPage;
