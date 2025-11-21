using Bff.Services;
using Microsoft.AspNetCore.Mvc;

namespace Bff.Controllers
{
    [ApiController]
    [Route("bff")]
    public class BffAuthController : ControllerBase
    {
        // HttpClientFactory para llamar a la API REAL.
        private readonly IHttpClientFactory _clientFactory;

        // Almacén de sesiones en memoria.
        private readonly SessionStore _sessionStore;

        public BffAuthController(IHttpClientFactory clientFactory, SessionStore sessionStore)
        {
            _clientFactory = clientFactory;
            _sessionStore = sessionStore;
        }

        // ======================================================
        //                LOGIN DEL BFF
        //   El front llama acá, NO al backend real.
        // ======================================================

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest req)
        {
            // 1) Creamos un HttpClient apuntando a la API REAL (configurado en Program.cs).
            var client = _clientFactory.CreateClient("ApiReal");

            // 2) Enviamos las credenciales a la API REAL: /auth/login
            //    Esto es un simple "proxy" del login.
            var apiResponse = await client.PostAsJsonAsync("/auth/login", req);

            // 3) Si la API REAL devolvió 401/400/etc, propagamos el error.
            if (!apiResponse.IsSuccessStatusCode)
            {
                if (apiResponse.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                    return Unauthorized("Usuario o contraseña incorrectos");

                return StatusCode(502, "Error llamando a la API real");
            }

            // 4) Leemos el JSON que devolvió la API REAL.
            //    Esperamos algo como { token, usuario, rol, dni, idVendedor }.
            var data = await apiResponse.Content.ReadFromJsonAsync<LoginResponse>();

            if (data == null || string.IsNullOrWhiteSpace(data.token))
            {
                // Si por algún motivo la API no devolvió token, devolvemos error.
                return StatusCode(500, "La API no devolvió un token válido");
            }

            // Normalizamos posibles valores 0 a null por seguridad.
            if (data.dni == 0) data.dni = null;
            if (data.idVendedor == 0) data.idVendedor = null;

            // 5) Creamos un identificador de sesión único.
            var sessionId = Guid.NewGuid().ToString();

            // 6) Guardamos en memoria la sesión asociada a ese sessionId.
            _sessionStore.Save(sessionId, new UserSession
            {
                Username = data.usuario,
                Rol = data.rol,
                Dni = data.dni,        // cliente → dni; vendedor → null
                IdVendedor = data.idVendedor, // vendedor → idVendedor; cliente → null
                Token = data.token       // El BFF es el ÚNICO que ve el token
            });

            // 7) Creamos la cookie HttpOnly que se enviará al navegador.
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,

                // Chrome exige Secure=true si usas SameSite=None
                Secure = true,

                // Necesario para permitir cookies con axios + localhost
                SameSite = SameSiteMode.None,

                Expires = DateTimeOffset.UtcNow.AddHours(2)
            };


            // Nombre de la cookie: "bff_session".
            // Valor de la cookie: el sessionId generado.
            Response.Cookies.Append("bff_session", sessionId, cookieOptions);

            // 8) Devolvemos una respuesta simple al frontend.
            //    AHORA también mandamos dni e idVendedor para que el front los guarde.
            return Ok(new
            {
                mensaje = "Login exitoso",
                usuario = data.usuario,
                rol = data.rol,
                dni = data.dni,
                idVendedor = data.idVendedor
                // El token queda almacenado en el BFF; jamás se envía al front.
            });
        }

        // ======================================================
        //                 GET /bff/user
        //   El frontend llama acá para saber QUIÉN es el usuario.
        //   Acá se valida la cookie y se trae la sesión real.
        // ======================================================

        [HttpGet("user")]
        public IActionResult GetUser()
        {
            // 1) Recuperamos el ID de sesión desde la cookie HttpOnly
            if (!Request.Cookies.TryGetValue("bff_session", out var sessionId))
                return Unauthorized("No hay sesión activa");

            // 2) Traemos la sesión real desde memoria
            var session = _sessionStore.Get(sessionId);

            if (session == null)
                return Unauthorized("Sesión expirada o inválida");

            // 3) Devolvemos los datos del usuario al frontend
            return Ok(new
            {
                username = session.Username,
                rol = session.Rol,
                dni = session.Dni,
                idVendedor = session.IdVendedor
            });
        }

        // --- LOGOUT: elimina la sesión y la cookie ---
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            // 1) Ver si existe la cookie con el sessionId
            if (Request.Cookies.TryGetValue("bff_session", out var sessionId))
            {
                // 2) Borrar sesión del diccionario
                _sessionStore.Remove(sessionId);
            }

            // 3) Borrar cookie en el navegador
            Response.Cookies.Delete("bff_session");

            // 4) Respuesta al frontend
            return Ok(new { mensaje = "Sesión cerrada" });
        }

        // ======================================================
        // Modelos internos usados por el BFF
        // ======================================================

        public class LoginRequest
        {
            public string Username { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }

        public class LoginResponse
        {
            public string token { get; set; } = string.Empty;
            public string usuario { get; set; } = string.Empty;
            public int rol { get; set; }
            public int? dni { get; set; }
            public int? idVendedor { get; set; }
        }
    }
}
