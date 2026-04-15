using SmartPoweredHome.Api.Data;
using SmartPoweredHome.Api.Models;

namespace SmartPoweredHome.Api.Services;

/// <summary>
/// Read-only repository over the LiteDB power-consumption collection.
/// Keeps controller code thin and testable.
/// </summary>
public sealed class PowerConsumptionRepository
{
    private readonly LiteDbContext _db;

    public PowerConsumptionRepository(LiteDbContext db) => _db = db;

    public int Count() => _db.Records.Count();

    public PagedResult<PowerConsumptionRecord> GetPaged(int page, int pageSize, string? dateFilter = null)
    {
        var query = _db.Records.Query();

        if (!string.IsNullOrWhiteSpace(dateFilter))
        {
            query = query.Where(r => r.Date == dateFilter);
        }

        var totalCount = dateFilter is null
            ? _db.Records.Count()
            : _db.Records.Count(r => r.Date == dateFilter);

        var items = query
            .OrderBy(r => r.Index)
            .Skip((page - 1) * pageSize)
            .Limit(pageSize)
            .ToList();

        return new PagedResult<PowerConsumptionRecord>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
        };
    }

    public IReadOnlyList<PowerConsumptionRecord> GetAll()
    {
        return _db.Records.Query().OrderBy(r => r.Index).ToList();
    }

    public DataSummary GetSummary()
    {
        var count = _db.Records.Count();
        var first = _db.Records.Query().OrderBy(r => r.Index).First();
        var last = _db.Records.Query().OrderByDescending(r => r.Index).First();

        return new DataSummary
        {
            TotalRecords = count,
            FirstDate = first?.Date ?? "",
            LastDate = last?.Date ?? "",
        };
    }
}
