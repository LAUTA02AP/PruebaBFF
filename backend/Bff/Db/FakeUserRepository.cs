// Ruta recomendada: ApiReal/Db/FakeUserRepository.cs
namespace WebApplication1.Db
{
    // Esta clase simula una "tabla" de usuarios en memoria.
    public class FakeUserRepository
    {
        // Lista en memoria que actúa como base de datos simulada.
        private readonly List<UserRecord> _users = new()
        {
            // Usuario tipo cliente (rol 0)
            new UserRecord
            {
                Username = "cliente1",
                Password = "1234",
                Rol = 0,
                Dni = 11111111,
                IdVendedor = null
            },

            // Usuario tipo vendedor (rol 1)
            new UserRecord
            {
                Username = "vendedor1",
                Password = "1234",
                Rol = 1,
                Dni = 22222222,
                IdVendedor = 10
            },

            // Usuario tipo admin (rol 9)
            new UserRecord
            {
                Username = "admin1",
                Password = "admin",
                Rol = 9,
                Dni = null,
                IdVendedor = null
            }
        };

        // Método para buscar un usuario por nombre de usuario.
        public UserRecord? GetByUsername(string username)
        {
            return _users.FirstOrDefault(u => u.Username == username);
        }
    }

    // Esta clase representa una fila de la "tabla Usuarios".
    public class UserRecord
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public int Rol { get; set; }
        public int? Dni { get; set; }
        public int? IdVendedor { get; set; }
    }
}
