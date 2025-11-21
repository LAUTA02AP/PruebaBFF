using Bff.Services;

var builder = WebApplication.CreateBuilder(args);

// =============================================
// Controllers
// =============================================
builder.Services.AddControllers();

// =============================================
// SessionStore — sesiones del BFF en memoria
// =============================================
builder.Services.AddSingleton<SessionStore>();

// =============================================
// HttpClient → API REAL
// =============================================
builder.Services.AddHttpClient("ApiReal", client =>
{
    client.BaseAddress = new Uri("https://localhost:44356"); // AJUSTAR
});

// =============================================
// Swagger
// =============================================
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// =============================================
// CORS + COOKIES
// =============================================
// ⚠ IMPORTANTE: estas 3 opciones SON OBLIGATORIAS para cookies HttpOnly
builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
            .SetIsOriginAllowed(origin => true); // obligatorio con SameSite=None

        // Obligatorio para SameSite=None en cookies
        policy.SetIsOriginAllowed(origin => true);
    });
});

var app = builder.Build();

// =============================================
// Swagger
// =============================================
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// =============================================
// HTTPS
// =============================================
app.UseHttpsRedirection();

// =============================================
// CORS antes de controllers
// =============================================
app.UseCors("frontend");


// =============================================
// Controllers
// =============================================
app.MapControllers();

app.Run();
