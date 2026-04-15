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
        _logger.LogInformation("DataSimulatorService started — generating records every 5 s");

        // Wait a little for the CSV import to finish
        await Task.Delay(TimeSpan.FromSeconds(3), stoppingToken);

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

                _logger.LogDebug(
                    "Simulated record: {Date} {Time}  GAP={GlobalActivePower:F2} kW",
                    record.Date, record.Time, record.GlobalActivePower);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                _logger.LogError(ex, "DataSimulatorService error");
            }

            await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
        }
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
