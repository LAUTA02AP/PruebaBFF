import axios from "axios";

// =====================================================================
// CONFIGURACIÓN BASE DEL CLIENTE AXIOS QUE HABLA CON EL BFF
// =====================================================================
const API = axios.create({
  // URL base donde está corriendo el BFF (.NET) — NO la API real.
  baseURL: "https://localhost:7120",

  // withCredentials:true => permite que el navegador ENVÍE y RECIBA cookies.
  // IMPORTANTE: sin esto, la cookie HttpOnly del BFF NO viaja al front.
  withCredentials: true,

  // Cabecera por defecto para peticiones JSON.
  headers: { "Content-Type": "application/json" },
});


// =====================================================================
// LOGIN — React manda usuario y contraseña al BFF
// =====================================================================
// IMPORTANTE:
// - React NO maneja tokens
// - React NO recibe tokens
// - React solo recibe información NO sensible: usuario, rol, mensaje
// - El BFF recibe user/pass, los manda a la API REAL, valida y crea sesión
// - El BFF devuelve JSON simple + una cookie HttpOnly (NO visible en JavaScript)
export const loginUser = async (username, password) => {
  try {
    console.log("Enviando credenciales al BFF:", { username, password });

    // -----------------------------------------------------------------
    // PETICIÓN AL BFF → POST /bff/login
    // El body contiene solo username y password.
    // -----------------------------------------------------------------
    const res = await API.post("/bff/login", {
      username,
      password
    });

    // -----------------------------------------------------------------
    // Qué devuelve el BFF: (EJEMPLO)
    // {
    //   mensaje: "Login exitoso",
    //   usuario: "cliente1",
    //   rol: 0
    // }
    //
    // Además: el BFF envía una COOKIE HttpOnly llamada "bff_session"
    // que contiene un sessionId (ej: 2093a8...).
    //
    // React NO puede ver ni leer esa cookie (HttpOnly), pero queda guardada
    // automáticamente en el navegador y se enviará en TODA petición futura.
    // -----------------------------------------------------------------
    console.log("Respuesta del BFF:", res.data);

    // Devuelve al componente React solo los datos no sensibles.
    return res.data;

  } catch (error) {
    console.error("Error en login:", error);
    throw error; // React manejará este error en la UI
  }
};


// =====================================================================
// OBTENER INFORMACIÓN DEL USUARIO AUTENTICADO
// =====================================================================
// Este endpoint es llamado por React DESPUÉS del login.
// No necesita user/pass.
// No necesita token.
// NO usa localStorage.
//
// ¿Cómo sabe el BFF quién es el usuario entonces?
// → Porque el navegador envía automáticamente la cookie HttpOnly bff_session.
// → El BFF busca esa cookie en memoria interna (SessionStore).
// → Si existe la sesión → devuelve datos del usuario.
// → Si NO existe la sesión → 401 Unauthorized.
//
// Ejemplo de respuesta:
// {
//   username: "cliente1",
//   rol: 0,
//   dni: 1234
// }
//
// Esa información la usa React para:
// - mostrar nombre
// - mostrar el rol
// - proteger rutas según rol
export const getUserInfo = async () => {
  try {
    // ---------------------------------------------------------------
    // GET /bff/user — el navegador envía la cookie automáticamente.
    // ---------------------------------------------------------------
    const res = await API.get("/bff/user");

    // res.data contiene SOLO datos del usuario, NO el token.
    return res.data;

  } catch (error) {
    console.error("Error obteniendo usuario:", error);

    // Si da 401 es porque la cookie expiró o no existe.
    throw error;
  }
};

//cerrar secion
export const logoutUser = async () => {
  try {
    const res = await API.post("/bff/logout");
    return res.data;
  } catch (err) {
    console.error("Error en logout:", err);
    throw err;
  }
};
