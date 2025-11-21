using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using WebApplication1.Data;

namespace WebApplication1.Controllers
{
    [ApiController]
    [Route("auth")]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly SqlHelper _db;

        public AuthController(IConfiguration config, SqlHelper db)
        {
            _config = config;
            _db = db;
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest req)
        {
            // ===========================================
            // 1) BUSCAR USUARIO REAL (CON COLUMNAS REALES)
            // ===========================================

            string sql = @"
                SELECT Usuario, Clave, Rol, DNI, idVendedor
                FROM Usuarios
                WHERE Usuario = @Username
            ";

            var user = await _db.QuerySingleAsync<dynamic>(
                sql,
                new { Username = req.Username }
            );

            if (user is null)
                return Unauthorized("Usuario o contraseña incorrectos");

            // ===========================================
            // 2) VALIDAR CONTRASEÑA REAL
            // ===========================================
            if (((string)user.Clave).Trim() != req.Password.Trim())
                return Unauthorized("Usuario o contraseña incorrectos");

            // ===========================================
            // 3) GENERAR TOKEN JWT
            // ===========================================
            var token = GenerateToken((string)user.Usuario, (int)user.Rol);

            // ===========================================
            // 4) RESPUESTA AL BFF
            // ===========================================
            var response = new
            {
                token = token,
                usuario = user.Usuario,
                rol = user.Rol,
                dni = user.DNI,
                idVendedor = user.idVendedor
            };

            return Ok(response);
        }


        private string GenerateToken(string username, int rol)
        {
            var jwt = _config.GetSection("Jwt");
            var expiresHours = int.TryParse(jwt["ExpiresHours"], out var h) ? h : 2;

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, username),
                new Claim(ClaimTypes.Role, rol.ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: jwt["Issuer"],
                audience: jwt["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(expiresHours),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public class LoginRequest
        {
            public string Username { get; set; } = "";
            public string Password { get; set; } = "";
        }
    }
}
