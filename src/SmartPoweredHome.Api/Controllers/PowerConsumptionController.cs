using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using SmartPoweredHome.Api.Hubs;
using SmartPoweredHome.Api.Models;
using SmartPoweredHome.Api.Services;

namespace SmartPoweredHome.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class PowerConsumptionController : ControllerBase
{
    private readonly PowerConsumptionRepository _repo;
    private readonly IHubContext<PowerConsumptionHub> _hub;

    public PowerConsumptionController(PowerConsumptionRepository repo, IHubContext<PowerConsumptionHub> hub)
    {
        _repo = repo;
        _hub = hub;
    }

    /// <summary>
    /// Paginated records – used by the data table (REQ-002).
    /// GET /api/powerconsumption?page=1&amp;pageSize=50&amp;date=1/1/26
    /// </summary>
    [HttpGet]
    public ActionResult<PagedResult<PowerConsumptionRecord>> Get(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] string? date = null)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 50;
        if (pageSize > 1000) pageSize = 1000;

        return Ok(_repo.GetPaged(page, pageSize, date));
    }

    /// <summary>
    /// All records at once – used by chart / computation signals on the client.
    /// GET /api/powerconsumption/all
    /// </summary>
    [HttpGet("all")]
    public ActionResult<IReadOnlyList<PowerConsumptionRecord>> GetAll()
    {
        return Ok(_repo.GetAll());
    }

    /// <summary>
    /// Lightweight summary (count + date range).
    /// GET /api/powerconsumption/summary
    /// </summary>
    [HttpGet("summary")]
    public ActionResult<DataSummary> GetSummary()
    {
        return Ok(_repo.GetSummary());
    }

    /// <summary>
    /// Push records for a given date to all connected SignalR clients.
    /// POST /api/powerconsumption/push?date=1/1/26
    /// </summary>
    [HttpPost("push")]
    public async Task<IActionResult> PushToClients([FromQuery] string date)
    {
        var result = _repo.GetPaged(1, int.MaxValue, date);
        await _hub.Clients.All.SendAsync("ReceiveRecords", result.Items);
        return Ok(new { pushed = result.Items.Count });
    }
}
