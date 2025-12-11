using System.Net.Http.Headers;
using Microsoft.AspNetCore.Mvc;
using Bff.Services;

namespace Bff.Controllers
{
    [ApiController]
    [Route("bff/sistema")]
    public class BffSistemaController : ControllerBase
    {
        private readonly IHttpClientFactory _clientFactory;
        private readonly SessionStore _sessionStore;

        public BffSistemaController(IHttpClientFactory clientFactory, SessionStore sessionStore)
        {
            _clientFactory = clientFactory;
            _sessionStore = sessionStore;
        }

        // ============================
        // Helpers
        // ============================
        private UserSession? GetSession()
        {
            if (!Request.Cookies.TryGetValue("bff_session", out var sessionId))
                return null;

            return _sessionStore.Get(sessionId);
        }

        private HttpClient CreateClient(UserSession session)
        {
            var client = _clientFactory.CreateClient("ApiReal");
            client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", session.Token);
            return client;
        }

        private async Task<IActionResult> Passthrough(HttpResponseMessage apiResponse)
        {
            var content = await apiResponse.Content.ReadAsStringAsync();
            return apiResponse.IsSuccessStatusCode
                ? Content(content, "application/json")
                : StatusCode((int)apiResponse.StatusCode, content);
        }

        // ======================================
        // GET cliente
        // ======================================
        [HttpGet("cliente")]
        public async Task<IActionResult> GetCliente(int dni)
        {
            var session = GetSession();
            if (session == null)
                return Unauthorized();

            var client = CreateClient(session);

            int dniFinal =
                session.Rol == 0
                    ? (session.Dni ?? 0)
                    : dni;

            var url = $"/sistema/cliente?dni={dniFinal}";
            return await Passthrough(await client.GetAsync(url));
        }

        // ======================================
        // GET saldo-cliente
        // ======================================
        [HttpGet("saldo-cliente")]
        public async Task<IActionResult> GetSaldoCliente(int? dni)
        {
            var session = GetSession();
            if (session == null)
                return Unauthorized();

            var client = CreateClient(session);

            int dniFinal =
                session.Rol == 0
                    ? (session.Dni ?? 0)
                    : (dni ?? 0);

            var url = $"/sistema/saldo-cliente?dni={dniFinal}";
            return await Passthrough(await client.GetAsync(url));
        }

        // ======================================
        // Vendedor → Clientes del vendedor
        // ======================================
        [HttpGet("clientes-vendedor")]
        public async Task<IActionResult> GetClientesPorVendedor()
        {
            var session = GetSession();
            if (session == null)
                return Unauthorized();

            if (session.IdVendedor == null)
                return Forbid();

            var client = CreateClient(session);

            var url =
                $"/sistema/clientes-vendedor?idVendedor={session.IdVendedor.Value}";

            return await Passthrough(await client.GetAsync(url));
        }

        // ======================================
        // GET Pedidos
        // ================================================
        // GET /bff/sistema/pedidos?dni=123
        // - Cliente (rol 0): siempre usa su propio DNI almacenado en la sesión.
        //   Si el DNI en la sesión está null (dato mal cargado), usa el parámetro de la URL.
        // - Vendedor/Admin: puede ver pedidos de un cliente, usa el DNI de la URL.
        //   Además, el BFF enviará idVendedor para que la API real valide la pertenencia.
        // ================================================
        [HttpGet("pedidos")]
        public async Task<IActionResult> GetPedidos(int dni)
        {
            var session = GetSession();
            if (session == null)
                return Unauthorized("Sesión inválida o expirada");

            var client = CreateClient(session);

            // Decidir qué DNI usar
            int dniFinal = session.Rol == 0
                ? (session.Dni ?? dni)  // cliente: usa su DNI
                : dni;                  // vendedor/admin: usa el DNI pasado por la URL

            string url;

            if (session.Rol == 0)
            {
                // Cliente: NO se envía idVendedor
                url = $"/sistema/pedidos?dni={dniFinal}";
            }
            else
            {
                // Vendedor/Admin: se envía idVendedor
                url = $"/sistema/pedidos?dni={dniFinal}&idVendedor={session.IdVendedor}";
            }

            var apiResponse = await client.GetAsync(url);
            return await Passthrough(apiResponse);
        }


        // ======================================
        // GET Detallle pedido 
        // ======================================
        [HttpGet("detalle-pedido")]
        public async Task<IActionResult> GetDetallePedido(int idPedido)
        {
            var session = GetSession();
            if (session == null)
                return Unauthorized();

            var client = CreateClient(session);

            string url;

            if (session.Rol == 0)
            {
                int dni = session.Dni ?? 0;
                url = $"/sistema/detalle-pedido?idPedido={idPedido}&dni={dni}";
            }
            else
            {
                if (session.IdVendedor == null)
                    return Forbid();

                int idVendedor = session.IdVendedor.Value;
                url = $"/sistema/detalle-pedido?idPedido={idPedido}&idVendedor={idVendedor}";
            }

            return await Passthrough(await client.GetAsync(url));
        }

        [HttpGet("productos")]
        public async Task<IActionResult> GetProductos()
        {
            var session = GetSession();
            if (session == null)
                return Unauthorized();

            var client = CreateClient(session);

            // Llamado a la API : GET /sistema/productos
            var url = "/sistema/productos";

            var apiResponse = await client.GetAsync(url);
            return await Passthrough(apiResponse);
        }

    }
}

