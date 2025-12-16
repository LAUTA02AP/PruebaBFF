import React, { useEffect, useState } from "react";
import "../styles/Componentes/pedidoEditModal.css";

export default function PedidoEditModal({
  open,
  pedido,
  onClose,
  onSave,
  saving = false,
  errorMsg = "",
}) {
  const [fecha, setFecha] = useState("");
  const [total, setTotal] = useState("");

  useEffect(() => {
    if (!open || !pedido) return;

    const rawFecha = pedido.Fecha ?? pedido.fecha ?? null;
    const yyyyMmDd = rawFecha
      ? new Date(rawFecha).toISOString().slice(0, 10)
      : "";

    setFecha(yyyyMmDd);

    const t = Number(pedido.Total ?? pedido.total ?? 0);
    setTotal(String(Number.isFinite(t) ? t : 0));
  }, [open, pedido]);

  if (!open || !pedido) return null;

  const idPedido = pedido.Id ?? pedido.id;

  const handleSave = () => {
    onSave({
      idPedido,
      Fecha: fecha || null,
      Total: total === "" ? null : Number(total),
    });
  };

  return (
    <div className="pem-overlay" onClick={onClose}>
      <div className="pem-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pem-header">
          <div className="pem-title">
            Editar pedido <span className="pem-id">#{idPedido}</span>
          </div>

          <button type="button" className="pem-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="pem-body">
          <label className="pem-field">
            <span>ID (solo lectura)</span>
            <input value={idPedido} disabled />
          </label>

          <label className="pem-field">
            <span>Fecha</span>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </label>

          <label className="pem-field">
            <span>Total</span>
            <input
              type="number"
              step="0.01"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
            />
          </label>

          {!!errorMsg && <div className="pem-error">{errorMsg}</div>}
        </div>

        <div className="pem-actions">
          <button
            type="button"
            className="btn-table"
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="btn-table btn-table-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
