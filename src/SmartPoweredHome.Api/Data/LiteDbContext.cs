using LiteDB;
using SmartPoweredHome.Api.Models;

namespace SmartPoweredHome.Api.Data;

/// <summary>
/// Thin wrapper around LiteDB. Registered as a singleton so the database
/// file stays open for the lifetime of the application.
/// </summary>
public sealed class LiteDbContext : IDisposable
{
    private readonly LiteDatabase _db;

    public LiteDbContext(IConfiguration configuration)
    {
        var connectionString = configuration.GetValue<string>("LiteDb:ConnectionString")
            ?? "Filename=./Data/smart-powered-home.db;Mode=Shared";

        _db = new LiteDatabase(connectionString);

        // Ensure index on the numeric index column for fast paging / sorting.
        Records.EnsureIndex(r => r.Index);
        Records.EnsureIndex(r => r.Date);
    }

    public ILiteCollection<PowerConsumptionRecord> Records =>
        _db.GetCollection<PowerConsumptionRecord>("power_consumption");

    public bool IsImported =>
        _db.GetCollection("_meta").Exists(m => m["key"] == "imported");

    public void MarkImported()
    {
        var meta = _db.GetCollection("_meta");
        meta.Insert(new BsonDocument { ["key"] = "imported", ["at"] = DateTime.UtcNow.ToString("O") });
    }

    public void Dispose() => _db.Dispose();
}
