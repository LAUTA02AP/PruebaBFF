using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.Data;

namespace WebApplication1.Controllers
{
    [ApiController]
    [Route("sistema")]
    [Authorize]
    public class SistemaController : ControllerBase
    {
        private readonly SqlHelper _db;

        public SistemaController(SqlHelper db)
        {
            _db = db;
        }

        // ================================================
        // OBTENER NOMBRE + DNI DEL CLIENTE
        // ================================================
        [HttpGet("cliente")]
        public async Task<IActionResult> GetClientePorDni(int dni)
        {
            var sql = @"SELECT DNI, Nombre FROM Clientes WHERE DNI = @dni";

            var cliente = await _db.QuerySingleAsync<dynamic>(sql, new { dni });

            if (cliente == null)
                return NotFound($"No existe cliente con DNI {dni}");

            return Ok(cliente);
        }

        // ================================================
        // SALDO DEL CLIENTE = SUMA DE TODOS SUS PEDIDOS
        // ================================================
        [HttpGet("saldo-cliente")]
        public async Task<IActionResult> GetSaldoCliente(int dni)
        {
            try
            {
                var cliente = await _db.QuerySingleAsync<dynamic>(
                    @"SELECT DNI, Nombre FROM Clientes WHERE DNI = @dni",
                    new { dni });

                if (cliente == null)
                {
                    return Ok(new
                    {
                        dni,
                        nombre = "",
                        saldo = 0m,
                        totalPedidos = 0m
                    });
                }

                var totalPedidos = await _db.QuerySingleAsync<decimal?>(
                    @"SELECT SUM(Total) FROM Pedidos WHERE DNI = @dni",
                    new { dni }) ?? 0m;

                return Ok(new
                {
                    dni,
                    nombre = cliente.Nombre,
                    saldo = totalPedidos,
                    totalPedidos = totalPedidos
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // ================================================
        // CLIENTES DEL VENDEDOR + SALDO
        // ================================================
        [HttpGet("clientes-vendedor")]
        public async Task<IActionResult> GetClientesXVendedor(int idVendedor)
        {
            try
            {
                var clientes = await _db.QueryAsync<dynamic>(
                    @"SELECT DNI, Nombre 
                      FROM Clientes 
                      WHERE IdVendedor = @idVendedor",
                    new { idVendedor });

                var listaFinal = new List<object>();

                foreach (var c in clientes)
                {
                    var saldo = await _db.QuerySingleAsync<decimal?>(
                        @"SELECT SUM(Total) FROM Pedidos WHERE DNI = @dni",
                        new { dni = (int)c.DNI }) ?? 0m;

                    listaFinal.Add(new
                    {
                        dni = c.DNI,
                        nombre = c.Nombre,
                        saldo = saldo
                    });
                }

                return Ok(listaFinal);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // ================================================
        // PEDIDOS DEL CLIENTE / DEL VENDEDOR
        // - Cliente: llamada con solo dni
        // - Vendedor: llamada con dni + idVendedor
        // ================================================
        [HttpGet("pedidos")]
        public async Task<IActionResult> GetPedidos(int dni, int? idVendedor = null)
        {
            string sql;

            if (idVendedor.HasValue)
            {
                // Validación para vendedores.
                // Solo permite ver pedidos de clientes que realmente atiende ese vendedor.
                sql = @"
            SELECT p.Id, p.Fecha, p.Total, p.DNI, p.Usuario
            FROM Pedidos p
            INNER JOIN Clientes c ON c.DNI = p.DNI
            WHERE p.DNI = @dni
              AND c.IdVendedor = @idVendedor
            ORDER BY p.Fecha DESC, p.Id DESC";
            }
            else
            {
                // Validación para clientes.
                // El cliente solo puede ver sus propios pedidos filtrados por su propio DNI.
                sql = @"
            SELECT p.Id, p.Fecha, p.Total, p.DNI, p.Usuario
            FROM Pedidos p
            WHERE p.DNI = @dni
            ORDER BY p.Fecha DESC, p.Id DESC";
            }

            var pedidos = await _db.QueryAsync<dynamic>(sql, new { dni, idVendedor });
            return Ok(pedidos);
        }



        // ================================================
        // DETALLE DEL PEDIDO POR ID
        // - Cliente: idPedido + dni → solo si el pedido es suyo
        // - Vendedor: idPedido + idVendedor → solo si el cliente es suyo
        // ================================================
        [HttpGet("detalle-pedido")]
        public async Task<IActionResult> GetDetallePedido(
            int idPedido,
            int? dni = null,
            int? idVendedor = null)
        {
            if (!dni.HasValue && !idVendedor.HasValue)
            {
                // No permitimos que nadie llame sin identificarse
                return BadRequest("Debe especificar dni o idVendedor");
            }

            string sql;
            object parametros;

            if (dni.HasValue)
            {
                // CLIENTE: el pedido tiene que ser de ese DNI
                sql = @"
            SELECT 
                pd.Id,
                pd.IdCab AS IdPedido,
                p.Descripcion AS Producto,
                pd.Cantidad,
                pd.Precio,
                pd.SubTotal
            FROM PedidosDetalle pd
            INNER JOIN Pedidos pe   ON pe.Id  = pd.IdCab
            INNER JOIN Productos p  ON p.Id   = pd.IdProducto
            WHERE pd.IdCab = @idPedido
              AND pe.DNI   = @dni
            ORDER BY pd.Id";

                parametros = new { idPedido, dni };
            }
            else
            {
                //  VENDEDOR: el pedido tiene que ser de un cliente suyo
                sql = @"
            SELECT 
                pd.Id,
                pd.IdCab AS IdPedido,
                p.Descripcion AS Producto,
                pd.Cantidad,
                pd.Precio,
                pd.SubTotal
            FROM PedidosDetalle pd
            INNER JOIN Pedidos  pe ON pe.Id  = pd.IdCab
            INNER JOIN Clientes c  ON c.DNI = pe.DNI
            INNER JOIN Productos p ON p.Id  = pd.IdProducto
            WHERE pd.IdCab      = @idPedido
              AND c.IdVendedor  = @idVendedor
            ORDER BY pd.Id";

                parametros = new { idPedido, idVendedor };
            }

            var data = await _db.QueryAsync<dynamic>(sql, parametros);
            return Ok(data);
        }

        // ================================================
        // OBTENER PRODUCTOS
        // ================================================
        
        [HttpGet("productos")]
        public async Task<IActionResult> GetProductos()
        {
            try
            {
                var sql = @"SELECT Id, Descripcion, Precio FROM Productos";

                // Usamos tu SqlHelper con dynamic
                var productos = await _db.QueryAsync<dynamic>(sql);

                return Ok(productos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }


    }
}
