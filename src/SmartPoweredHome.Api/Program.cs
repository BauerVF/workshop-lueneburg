using SmartPoweredHome.Api.Auth;
using SmartPoweredHome.Api.Data;
using SmartPoweredHome.Api.Hubs;
using SmartPoweredHome.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// ---------- Authentication (simple API key) ----------
var apiKey = builder.Configuration.GetValue<string>("Auth:ApiKey") ?? "dev-api-key-2026";

builder.Services
    .AddAuthentication("ApiKey")
    .AddScheme<ApiKeyAuthOptions, ApiKeyAuthHandler>("ApiKey", opts =>
    {
        opts.ApiKey = apiKey;
    });
builder.Services.AddAuthorization();

// ---------- LiteDB + CSV import ----------
builder.Services.AddSingleton<LiteDbContext>();
builder.Services.AddScoped<PowerConsumptionRepository>();
builder.Services.AddHostedService<CsvImporter>();

// ---------- SignalR ----------
builder.Services.AddSignalR();

// ---------- Controllers + OpenAPI ----------
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// ---------- CORS (allow Angular dev server) ----------
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();       // required for SignalR
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<PowerConsumptionHub>("/hubs/power-consumption");

app.Run();
