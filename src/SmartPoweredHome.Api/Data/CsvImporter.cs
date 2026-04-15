using System.Globalization;
using SmartPoweredHome.Api.Models;

namespace SmartPoweredHome.Api.Data;

/// <summary>
/// Imports the household_power_consumption.csv into LiteDB on first application
/// start. Runs as a hosted service so it does not block the request pipeline.
/// </summary>
public sealed class CsvImporter : IHostedService
{
    private readonly LiteDbContext _db;
    private readonly ILogger<CsvImporter> _logger;
    private readonly string _csvPath;

    public CsvImporter(LiteDbContext db, ILogger<CsvImporter> logger, IConfiguration config)
    {
        _db = db;
        _logger = logger;
        _csvPath = config.GetValue<string>("CsvImport:FilePath")
            ?? Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "smart-powered-home", "public", "household_power_consumption.csv");
    }

    public Task StartAsync(CancellationToken cancellationToken)
    {
        if (_db.IsImported)
        {
            _logger.LogInformation("CSV already imported – skipping.");
            return Task.CompletedTask;
        }

        _logger.LogInformation("Importing CSV from {Path} …", _csvPath);
        var sw = System.Diagnostics.Stopwatch.StartNew();

        var records = ParseCsv(_csvPath);
        _db.Records.InsertBulk(records);
        _db.MarkImported();

        sw.Stop();
        _logger.LogInformation("Imported {Count} records in {Elapsed}.", _db.Records.Count(), sw.Elapsed);
        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;

    private static IEnumerable<PowerConsumptionRecord> ParseCsv(string path)
    {
        using var reader = new StreamReader(path);

        // Skip header line
        reader.ReadLine();

        string? line;
        while ((line = reader.ReadLine()) is not null)
        {
            if (string.IsNullOrWhiteSpace(line)) continue;

            var cols = line.Split(',');
            if (cols.Length < 10) continue;

            yield return new PowerConsumptionRecord
            {
                Index = ParseInt(cols[0]),
                Date = cols[1],
                Time = cols[2],
                GlobalActivePower = ParseDouble(cols[3]),
                GlobalReactivePower = ParseDouble(cols[4]),
                Voltage = ParseDouble(cols[5]),
                GlobalIntensity = ParseDouble(cols[6]),
                SubMetering1 = ParseDouble(cols[7]),
                SubMetering2 = ParseDouble(cols[8]),
                SubMetering3 = ParseDouble(cols[9]),
            };
        }
    }

    private static int ParseInt(string value) =>
        int.TryParse(value, CultureInfo.InvariantCulture, out var v) ? v : 0;

    private static double ParseDouble(string value) =>
        double.TryParse(value, CultureInfo.InvariantCulture, out var v) ? v : 0;
}
