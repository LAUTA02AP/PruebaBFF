using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Data;

namespace WebApplication1.Data
{
    public class SqlHelper
    {
        private readonly string _connectionString;

        public SqlHelper(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("Conexion")
                ?? throw new InvalidOperationException("Connection string no encontrada.");
        }

        private IDbConnection CreateConnection()
        {
            return new SqlConnection(_connectionString);
        }

        // Método genérico para consultas
        public async Task<IEnumerable<T>> QueryAsync<T>(string sql, object? parameters = null)
        {
            using var conn = CreateConnection();
            return await conn.QueryAsync<T>(sql, parameters);
        }

        // Método genérico para un único registro
        public async Task<T?> QuerySingleAsync<T>(string sql, object? parameters = null)
        {
            using var conn = CreateConnection();
            return await conn.QuerySingleOrDefaultAsync<T>(sql, parameters);
        }

        // Método genérico para comandos (INSERT, UPDATE, DELETE)
        public async Task<int> ExecuteAsync(string sql, object? parameters = null)
        {
            using var conn = CreateConnection();
            return await conn.ExecuteAsync(sql, parameters);
        }
    }
}
