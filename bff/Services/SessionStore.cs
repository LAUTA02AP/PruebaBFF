// Ruta: Bff/Services/SessionStore.cs
namespace Bff.Services
{
    // Esta clase representa la sesión del usuario que el BFF guarda en memoria.
    public class UserSession
    {
        public string Username { get; set; } = string.Empty;
        public int Rol { get; set; }
        public int? Dni { get; set; }
        public int? IdVendedor { get; set; }
        public string Token { get; set; } = string.Empty; // JWT de la API real
    }

    // Almacén de sesiones en memoria (clave: sessionId, valor: UserSession).
    public class SessionStore
    {
        // Diccionario en memoria simulando un "SessionStore".
        private readonly Dictionary<string, UserSession> _sessions = new();

        // Guarda o reemplaza una sesión asociada a un sessionId.
        public void Save(string sessionId, UserSession session)
        {
            _sessions[sessionId] = session;
        }

        // Intenta obtener una sesión a partir del sessionId.
        public UserSession? Get(string sessionId)
        {
            _sessions.TryGetValue(sessionId, out var s);
            return s;
        }

        // IMPORTANTE: permite borrar sesiones (para Logout)
        public void Remove(string sessionId)
        {
            if (_sessions.ContainsKey(sessionId))
            {
                _sessions.Remove(sessionId);
            }
        }
    }
}
