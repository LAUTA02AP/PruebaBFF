using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using WebApplication1.Data;   // SqlHelper / repositorio real

var builder = WebApplication.CreateBuilder(args);

// ---------------------------------------------------------
// 1) Controllers
// ---------------------------------------------------------
builder.Services.AddControllers();

// ---------------------------------------------------------
// 2) Conexión a BD REAL (NO fake)
// ---------------------------------------------------------
builder.Services.AddSingleton<SqlHelper>();
// si querés usar AddScoped mejor → builder.Services.AddScoped<SqlHelper>();

// ---------------------------------------------------------
// 3) Swagger + Autorización JWT
// ---------------------------------------------------------
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "API Real del Sistema",
        Version = "v1"
    });

    // Seguridad para Swagger
    var scheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header
    };

    c.AddSecurityDefinition("Bearer", scheme);
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        { scheme, Array.Empty<string>() }
    });
});

// ---------------------------------------------------------
// 4) JWT (lo necesita porque el BFF enviará un Bearer Token)
// ---------------------------------------------------------
var jwt = builder.Configuration.GetSection("Jwt");
var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwt["Issuer"],
            ValidAudience = jwt["Audience"],
            IssuerSigningKey = signingKey,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();


// =======================================================================
//                        MIDDLEWARE PIPELINE
// =======================================================================

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// NO usar CORS acá. El BFF llama desde servidor, no navegador.
// NO usar cookies ni sesiones.

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
