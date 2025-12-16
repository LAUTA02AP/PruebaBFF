// src/pages/PedidosPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getPedidosPorDni,
  getClientePorDni,
  getUserInfo,
  updatePedido,
} from "../api/Services";

import BotonVolver from "../components/common/BotonVolver";
import BotonDescargar from "../components/common/BotonDescarga";
import DataTable from "../components/DataTable";
import PedidoEditModal from "../components/PedidoEditModal";

import "../styles/Generales/pages.css";

function PedidosPage() {
  const [pedidos, setPedidos] = useState([]);
  const [clienteNombre, setClienteNombre] = useState("");
  const [dniMostrar, setDniMostrar] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // modal states
  const [editOpen, setEditOpen] = useState(false);
  const [pedidoSel, setPedidoSel] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { dni } = useParams();
  const navigate = useNavigate();

  const openEdit = (pedido) => {
    setErrorMsg("");
    setPedidoSel(pedido);
    setEditOpen(true);
  };

  const closeEdit = () => {
    if (saving) return;
    setEditOpen(false);
    setPedidoSel(null);
    setErrorMsg("");
  };

  const handleSaveEdit = async ({ idPedido, Fecha, Total }) => {
    try {
      setSaving(true);
      setErrorMsg("");

      // armamos patch SOLO con lo que venga (podés endurecer validaciones acá)
      const patch = {};
      if (Fecha !== null) patch.Fecha = Fecha;
      if (Total !== null && Number.isFinite(Total)) patch.Total = Total;

      const updated = await updatePedido(idPedido, patch);

      // refresco local (para ver el cambio al toque)
      setPedidos((prev) =>
        prev.map((p) => {
          const pid = p.Id ?? p.id;
          return String(pid) === String(idPedido)
            ? {
                ...p,
                Fecha: updated?.Fecha ?? p.Fecha,
                Total: updated?.Total ?? p.Total,
              }
            : p;
        })
      );

      closeEdit();
    } catch (err) {
      console.error("❌ Error updatePedido:", err?.response?.data || err);
      setErrorMsg(
        typeof err?.response?.data === "string"
          ? err.response.data
          : "No se pudo actualizar el pedido."
      );
    } finally {
      setSaving(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        id: "id",
        header: "ID",
        accessorFn: (row) => row.Id ?? row.id ?? "",
        cell: (info) => info.getValue(),
        meta: { label: "ID" },
      },
      {
        id: "fecha",
        header: "Fecha",
        accessorFn: (row) => row.Fecha ?? row.fecha ?? null,
        cell: (info) => {
          const fecha = info.getValue();
          return fecha ? new Date(fecha).toLocaleDateString("es-AR") : "-";
        },
        meta: { label: "Fecha" },
      },
      {
        id: "total",
        header: "Total",
        accessorFn: (row) => row.Total ?? row.total ?? 0,
        cell: (info) => `$${Number(info.getValue() ?? 0).toFixed(2)}`,
        meta: { className: "text-right", label: "Total" },
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

              {/* ✅ solo rol 1 ve el lápiz */}
              {user?.rol === 1 && (
                <button
                  type="button"
                  className="btn-table btn-table-edit"
                  onClick={() => openEdit(original)}
                  title="Editar pedido"
                >
                  ✎
                </button>
              )}
            </div>
          );
        },
        meta: { className: "table-actions text-center", label: "" },
      },
    ],
    [navigate, user]
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
        />
      )}

      {/* ✅ Modal de edición */}
      <PedidoEditModal
        open={editOpen}
        pedido={pedidoSel}
        onClose={closeEdit}
        onSave={handleSaveEdit}
        saving={saving}
        errorMsg={errorMsg}
      />
    </div>
  );
}

export default PedidosPage;
