using Microsoft.AspNetCore.SignalR;
using SmartPoweredHome.Api.Data;
using SmartPoweredHome.Api.Hubs;
using SmartPoweredHome.Api.Models;

namespace SmartPoweredHome.Api.Services;

/// <summary>
/// Background service that generates a realistic power-consumption record
/// every 5 seconds for the current date/time and pushes it to connected
/// SignalR clients via "ReceiveNewRecord".
///
/// Values are modelled after a typical European household:
///   - Global active power    : 0.2 – 6.0 kW  (time-of-day curve)
///   - Global reactive power  : 5 – 30 % of active power
///   - Voltage                : 230 V ± 5 %
///   - Global intensity       : derived from active power / voltage
///   - Sub-meterings          : portions of active power (in Wh per minute)
/// </summary>
public sealed class DataSimulatorService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IHubContext<PowerConsumptionHub> _hub;
    private readonly ILogger<DataSimulatorService> _logger;
    private readonly Random _rng = new();

    /// <summary>Typical hourly active-power profile (kW) for a European household.</summary>
    private static readonly double[] HourlyProfile =
    [
        //  0     1     2     3     4     5     6     7     8     9    10    11
        0.35, 0.28, 0.25, 0.23, 0.22, 0.30, 0.80, 1.60, 1.80, 1.20, 0.90, 0.85,
        // 12    13    14    15    16    17    18    19    20    21    22    23
        1.10, 0.95, 0.70, 0.65, 0.80, 1.50, 2.80, 3.50, 3.00, 2.20, 1.40, 0.60,
    ];

    public DataSimulatorService(
        IServiceScopeFactory scopeFactory,
        IHubContext<PowerConsumptionHub> hub,
        ILogger<DataSimulatorService> logger)
    {
        _scopeFactory = scopeFactory;
        _hub = hub;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("DataSimulatorService started");

        // Wait a little for the CSV import to finish
        await Task.Delay(TimeSpan.FromSeconds(3), stoppingToken);

        // ── Backfill today from 00:00 to now (1 record per minute) ──
        await BackfillTodayAsync(stoppingToken);

        // ── Live ticker: generate a record every 5 seconds ──
        _logger.LogInformation("Live ticker running — generating records every 5 s");
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var record = GenerateRecord(DateTime.Now);

                using (var scope = _scopeFactory.CreateScope())
                {
                    var db = scope.ServiceProvider.GetRequiredService<LiteDbContext>();
                    var lastIndex = db.Records.Query()
                        .OrderByDescending(r => r.Index)
                        .Select(r => r.Index)
                        .FirstOrDefault();
                    record.Index = lastIndex + 1;
                    db.Records.Insert(record);
                }

                await _hub.Clients.All.SendAsync("ReceiveNewRecord", record, stoppingToken);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                _logger.LogError(ex, "DataSimulatorService error");
            }

            await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
        }
    }

    /// <summary>
    /// Insert simulated records for today, one per minute from 00:00 to now.
    /// Skips if records for today already exist in the database.
    /// </summary>
    private async Task BackfillTodayAsync(CancellationToken ct)
    {
        var today = DateTime.Today;
        var todayStr = $"{today.Month}/{today.Day}/{today.Year % 100}";

        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<LiteDbContext>();

        // Skip if we already have data for today
        if (db.Records.Exists(r => r.Date == todayStr))
        {
            _logger.LogInformation("Backfill skipped — records for {Date} already exist", todayStr);
            return;
        }

        var now = DateTime.Now;
        var minutesSinceMidnight = (int)(now - today).TotalMinutes;
        if (minutesSinceMidnight <= 0) return;

        _logger.LogInformation(
            "Backfilling {Count} records for {Date} (00:00 → {Time})",
            minutesSinceMidnight, todayStr, now.ToString("HH:mm"));

        var lastIndex = db.Records.Query()
            .OrderByDescending(r => r.Index)
            .Select(r => r.Index)
            .FirstOrDefault();

        var batch = new List<PowerConsumptionRecord>(minutesSinceMidnight);
        for (var m = 0; m < minutesSinceMidnight; m++)
        {
            ct.ThrowIfCancellationRequested();
            var timestamp = today.AddMinutes(m);
            var record = GenerateRecord(timestamp);
            record.Index = lastIndex + 1 + m;
            batch.Add(record);
        }

        db.Records.InsertBulk(batch);
        _logger.LogInformation("Backfill complete — {Count} records inserted", batch.Count);

        // No SignalR push for backfill — the UI loads all data via the /all endpoint
        await Task.CompletedTask;
    }

    /// <summary>
    /// Generate a realistic power-consumption record for the given timestamp.
    /// </summary>
    private PowerConsumptionRecord GenerateRecord(DateTime now)
    {
        // Base power from the hourly profile with smooth interpolation
        var hour = now.Hour;
        var nextHour = (hour + 1) % 24;
        var minuteFraction = now.Minute / 60.0;
        var basePower = HourlyProfile[hour] * (1 - minuteFraction)
                      + HourlyProfile[nextHour] * minuteFraction;

        // Add ±20 % random noise
        var globalActivePower = basePower * (0.8 + _rng.NextDouble() * 0.4);
        globalActivePower = Math.Round(Math.Max(0.076, globalActivePower), 3);

        // Reactive power: 5–25 % of active power
        var globalReactivePower = globalActivePower * (0.05 + _rng.NextDouble() * 0.20);
        globalReactivePower = Math.Round(globalReactivePower, 3);

        // Voltage: 230 V ± ~5 %
        var voltage = 230.0 + (_rng.NextDouble() - 0.5) * 24;
        voltage = Math.Round(voltage, 2);

        // Intensity: P / V (simplified, single-phase)
        var globalIntensity = Math.Round((globalActivePower * 1000) / voltage / 1000 * 4.2 + _rng.NextDouble() * 2, 1);

        // Sub-meterings in Wh per minute — fractions of total active power
        var totalWh = globalActivePower * 1000.0 / 60.0; // Wh for this minute-sample
        var sub1 = Math.Round(totalWh * (0.05 + _rng.NextDouble() * 0.15), 3); // Kitchen
        var sub2 = Math.Round(totalWh * (0.05 + _rng.NextDouble() * 0.15), 3); // Laundry
        var sub3 = Math.Round(totalWh * (0.10 + _rng.NextDouble() * 0.25), 3); // Heating/AC

        // Date in M/D/YY format (no leading zeros, two-digit year)
        var dateStr = $"{now.Month}/{now.Day}/{now.Year % 100}";
        var timeStr = $"{now.Hour}:{now.Minute:D2}:{now.Second:D2}";

        return new PowerConsumptionRecord
        {
            Date = dateStr,
            Time = timeStr,
            GlobalActivePower = globalActivePower,
            GlobalReactivePower = globalReactivePower,
            Voltage = voltage,
            GlobalIntensity = globalIntensity,
            SubMetering1 = sub1,
            SubMetering2 = sub2,
            SubMetering3 = sub3,
        };
    }
}
