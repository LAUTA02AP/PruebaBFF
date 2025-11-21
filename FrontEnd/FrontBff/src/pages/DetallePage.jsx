import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDetallePedido } from "../api/Services";
import BotonVolver from "../components/BotonVolver";
import "../styles/Detalle.css";  // 🔥 corregido

function DetallePage() {
  const { idPedido } = useParams();

  const [detalles, setDetalles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargar() {
      try {
        const data = await getDetallePedido(idPedido);
        setDetalles(data);
      } catch (err) {
        console.error("Error cargando detalle:", err);
      } finally {
        setLoading(false);
      }
    }
    cargar();
  }, [idPedido]);

  if (loading) return <p className="loading-text">Cargando detalle...</p>;

  if (!detalles || detalles.length === 0) {
    return (
      <div className="detalle-container">
        <BotonVolver />
        <h2>Detalle del Pedido #{idPedido}</h2>
        <p className="no-detalle">
          No hay productos registrados para este pedido.
        </p>
      </div>
    );
  }

  // ==============================
  // CÁLCULOS
  // ==============================
  const totalCantidad = detalles.reduce((acc, item) => acc + item.Cantidad, 0);
  const totalSubTotal = detalles.reduce((acc, item) => acc + item.SubTotal, 0);

  return (
    <div className="detalle-container">
      <div className="detalle-header">
        <BotonVolver />
        <h2>Detalle del Pedido #{idPedido}</h2>
      </div>

      <table className="detalle-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio Unitario ($)</th>
            <th>Subtotal ($)</th>
          </tr>
        </thead>

        <tbody>
          {detalles.map((item) => (
            <tr key={item.Id}>
              <td>{item.Producto}</td>
              <td>{item.Cantidad}</td>
              <td>{Number(item.Precio).toFixed(2)}</td>
              <td>{Number(item.SubTotal).toFixed(2)}</td>
            </tr>
          ))}

          <tr className="fila-total">
            <td><strong>Total</strong></td>
            <td><strong>{totalCantidad}</strong></td>
            <td>—</td>
            <td><strong>${totalSubTotal.toFixed(2)}</strong></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default DetallePage;
