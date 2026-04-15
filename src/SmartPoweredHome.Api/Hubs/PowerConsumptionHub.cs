using Microsoft.AspNetCore.SignalR;

namespace SmartPoweredHome.Api.Hubs;

/// <summary>
/// SignalR hub for real-time power-consumption updates.
/// Clients join by connecting to /hubs/power-consumption.
///
/// Usage from server-side code:
///   hubContext.Clients.All.SendAsync("ReceiveRecords", records);
///   hubContext.Clients.All.SendAsync("ReceiveSummary", summary);
/// </summary>
public sealed class PowerConsumptionHub : Hub
{
    private readonly ILogger<PowerConsumptionHub> _logger;

    public PowerConsumptionHub(ILogger<PowerConsumptionHub> logger)
    {
        _logger = logger;
    }

    public override Task OnConnectedAsync()
    {
        _logger.LogInformation("Client connected: {ConnectionId}", Context.ConnectionId);
        return base.OnConnectedAsync();
    }

    public override Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation("Client disconnected: {ConnectionId}", Context.ConnectionId);
        return base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Client can request a data push for a specific date.
    /// The server responds by sending "ReceiveRecords" back to the caller.
    /// </summary>
    public async Task RequestDataForDate(string date)
    {
        _logger.LogInformation("Client {ConnectionId} requested data for {Date}", Context.ConnectionId, date);
        // The controller or a background service can push data via IHubContext.
        // This method exists so the client has a server-callable entry point.
        await Clients.Caller.SendAsync("ReceiveAck", $"Request for {date} received");
    }
}
