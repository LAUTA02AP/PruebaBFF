
import axios from "axios";

// URL del BFF
const BFF_URL = "https://localhost:7120/bff";

// Axios preconfigurado para el BFF
const API = axios.create({
  baseURL: BFF_URL,
  withCredentials: true, // Necesario para enviar cookie HTTPOnly
  headers: { "Content-Type": "application/json" },
});

// =====================================================================
// AUTH (LOGIN / USER / LOGOUT)
// =====================================================================

export const loginUser = async (username, password) => {
  const res = await API.post("/login", { username, password });
  return res.data;
};

export const getUserInfo = async () => {
  const res = await API.get("/user");
  return res.data;
}

export const logoutUser = async () => {
  const res = await API.post("/logout");
  return res.data;
};

// =====================================================================
// SISTEMA (CLIENTES, SALDOS, PEDIDOS)
// =====================================================================

// CLIENTES DEL VENDEDOR
export const getClientesVendedor = async () => {
  const res = await API.get("/sistema/clientes-vendedor");
  return res.data;
};

// SALDO DEL CLIENTE
export const getSaldoCliente = async (dni) => {
  const res = await API.get(`/sistema/saldo-cliente`, {
    params: { dni: Number(dni) },
  });
  return res.data;
};

// PEDIDOS POR DNI
export const getPedidosPorDni = async (dni) => {
  const res = await API.get(`/sistema/pedidos`, {
    params: { dni: Number(dni) },
  });
  return res.data;
};

// CLIENTE POR DNI
export const getClientePorDni = async (dni) => {
  const res = await API.get(`/sistema/cliente`, {
    params: { dni: Number(dni) },
  });
  return res.data;
};

// =====================================================================
// DETALLE DEL PEDIDO
// =====================================================================
export const getDetallePedido = async (idPedido) => {
  const res = await API.get("/sistema/detalle-pedido", {
    params: { idPedido: Number(idPedido) },
  });
  return res.data;
};

export const getProductos = async () => {
  const res = await API.get("/sistema/productos");
  return res.data; // array de productos
};


//""""""""""""PUT"""""""""""""""""

export const updatePedido = async (idPedido, payload) => {
  const res = await API.put(`/sistema/pedidos/${Number(idPedido)}`, payload);
  return res.data;
};
