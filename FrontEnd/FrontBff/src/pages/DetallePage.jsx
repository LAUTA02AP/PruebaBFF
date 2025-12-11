// src/pages/DetallePage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDetallePedido } from "../api/Services";
import BotonVolver from "../components/common/BotonVolver";

import "../styles/Generales/pages.css";
import "../styles/Generales/Table.css";

function DetallePage() {
  const { idPedido } = useParams();

  const [detalles, setDetalles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargar() {
      try {
        const data = await getDetallePedido(idPedido);
        setDetalles(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error cargando detalle:", err);
      } finally {
        setLoading(false);
      }
    }
    cargar();
  }, [idPedido]);

  if (loading) {
    return <p className="loading-text">Cargando detalle...</p>;
  }

  if (!detalles || detalles.length === 0) {
    return (
      <div className="table-page-wrapper">
        <div className="table-page-header">
          <div className="table-page-header-left">
            <BotonVolver visible={true} />
            <div>
              <h2 className="table-page-title">
                Detalle del Pedido #{idPedido}
              </h2>
              <div className="table-page-subtitle">
                No hay productos registrados para este pedido.
              </div>
            </div>
          </div>
        </div>

        {/* Podés dejar esto solo como texto, sin card */}
      </div>
    );
  }

  // ==============================
  // CÁLCULOS
  // ==============================
  const totalCantidad = detalles.reduce(
    (acc, item) => acc + Number(item.Cantidad ?? item.cantidad ?? 0),
    0
  );
  const totalSubTotal = detalles.reduce(
    (acc, item) => acc + Number(item.SubTotal ?? item.subTotal ?? 0),
    0
  );

  return (
    <div className="table-page-wrapper">
      {/* HEADER de la página */}
      <div className="table-page-header">
        <div className="table-page-header-left">
          <BotonVolver visible={true} />

          <div>
            <h2 className="table-page-title">
              Detalle del Pedido #{idPedido}
            </h2>
            <div className="table-page-subtitle">
              Productos y totales del pedido seleccionado
            </div>
          </div>
        </div>
      </div>

      {/* CARD: tabla */}
      <div className="table-card">
        <div className="table-wrapper">
          <table className="table detalle-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th className="text-center">Cantidad</th>
                <th className="text-right">Precio Unitario ($)</th>
                <th className="text-right">Subtotal ($)</th>
              </tr>
            </thead>

            <tbody>
              {detalles.map((item) => (
                <tr key={item.Id ?? item.id}>
                  <td>{item.Producto ?? item.producto}</td>
                  <td className="text-center">
                    {Number(item.Cantidad ?? item.cantidad ?? 0)}
                  </td>
                  <td className="text-right">
                    {Number(item.Precio ?? item.precio ?? 0).toFixed(2)}
                  </td>
                  <td className="text-right">
                    {Number(item.SubTotal ?? item.subTotal ?? 0).toFixed(2)}
                  </td>
                </tr>
              ))}

              <tr className="fila-total">
                <td>
                  <strong>Total</strong>
                </td>
                <td className="text-center">
                  <strong>{totalCantidad}</strong>
                </td>
                <td className="text-right">—</td>
                <td className="text-right">
                  <strong>${totalSubTotal.toFixed(2)}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* No hace falta paginación acá */}
      </div>
    </div>
  );
}

export default DetallePage;
