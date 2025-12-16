// src/pages/DetallePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getDetallePedido } from "../api/Services";

import BotonVolver from "../components/common/BotonVolver";
import DataTable from "../components/DataTable";

import "../styles/Generales/pages.css";
import "../styles/Generales/Table.css";

function DetallePage() {
  const { idPedido } = useParams();

  const [detalles, setDetalles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargar() {
      try {
        // Trae el detalle del pedido por ID
        const data = await getDetallePedido(idPedido);
        // Asegura que siempre sea array
        setDetalles(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error cargando detalle:", err);
      } finally {
        setLoading(false);
      }
    }
    cargar();
  }, [idPedido]);

  // ==============================
  // TOTALES (para mostrar en toolbar)
  // ==============================
  const totalCantidad = detalles.reduce(
    (acc, item) => acc + Number(item.Cantidad ?? item.cantidad ?? 0),
    0
  );

  const totalSubTotal = detalles.reduce(
    (acc, item) => acc + Number(item.SubTotal ?? item.subTotal ?? 0),
    0
  );

  // ==============================
  // COLUMNAS PARA DataTable
  // ==============================
  const columns = useMemo(
    () => [
      /**
       * COLUMNA: Producto
       * - id: identificador interno de la columna
       * - header: texto del <th> en desktop
       * - accessorFn: cómo obtener el valor “crudo” desde la fila
       * - cell: cómo se renderiza ese valor en el <td>
       * - meta.label: etiqueta para mobile cards (data-label)
       */
      {
        id: "producto",
        header: "Producto",
        accessorFn: (row) => row.Producto ?? row.producto ?? "-",
        cell: (info) => info.getValue(),
        meta: { label: "Producto" },
      },

      /**
       * COLUMNA: Cantidad
       * - accessorFn devuelve número para poder sumar/ordenar si quisieras
       * - cell muestra el número (sin decimales)
       * - meta.className centra el contenido en desktop
       * - meta.label define el label en modo “cards”
       */
      {
        id: "cantidad",
        header: "Cantidad",
        accessorFn: (row) => Number(row.Cantidad ?? row.cantidad ?? 0),
        cell: (info) => Number(info.getValue() ?? 0),
        meta: { className: "text-center", label: "Cantidad" },
      },

      /**
       * COLUMNA: Precio Unitario ($)
       * - accessorFn toma Precio/precio y lo convierte a Number
       * - cell lo formatea con 2 decimales
       * - meta.className lo alinea a la derecha en desktop
       * - meta.label es la etiqueta que se ve en mobile
       */
      {
        id: "precio",
        header: "Precio Unitario ($)",
        accessorFn: (row) => Number(row.Precio ?? row.precio ?? 0),
        cell: (info) => Number(info.getValue() ?? 0).toFixed(2),
        meta: { className: "text-right", label: "Precio unitario" },
      },

      /**
       * COLUMNA: Subtotal ($)
       * - accessorFn toma SubTotal/subTotal y lo convierte a Number
       * - cell lo formatea con 2 decimales
       * - meta.className lo alinea a la derecha
       * - meta.label define el label en mobile
       */
      {
        id: "subtotal",
        header: "Subtotal ($)",
        accessorFn: (row) => Number(row.SubTotal ?? row.subTotal ?? 0),
        cell: (info) => Number(info.getValue() ?? 0).toFixed(2),
        meta: { className: "text-right", label: "Subtotal" },
      },
    ],
    []
  );

  if (loading) {
    return <p className="loading-text">Cargando detalle...</p>;
  }

  // Si está vacío, mostramos header y un texto
  if (!detalles || detalles.length === 0) {
    return (
      <div className="table-page-wrapper">
        <div className="table-page-header">
          <div className="table-page-header-left">
            <BotonVolver visible={true} />
            <div>
              <h2 className="table-page-title">Detalle del Pedido #{idPedido}</h2>
              <div className="table-page-subtitle">
                No hay productos registrados para este pedido.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="table-page-wrapper">
      <div className="table-page-header">
        <div className="table-page-header-left">
          <BotonVolver visible={true} />
          <div>
            <h2 className="table-page-title">Detalle del Pedido #{idPedido}</h2>
            <div className="table-page-subtitle">
              Productos y totales del pedido seleccionado
            </div>
          </div>
        </div>
      </div>

      <DataTable
        data={detalles}
        columns={columns}
        pageSizeDefault={50}
        searchPlaceholder="Buscar producto..."
        renderToolbarRight={
          // Resumen de totales a la derecha del toolbar
          <span className="table-count">
            Cantidad total: <strong>{totalCantidad}</strong> — Total:{" "}
            <strong>${totalSubTotal.toFixed(2)}</strong>
          </span>
        }
      />
    </div>
  );
}

export default DetallePage;

