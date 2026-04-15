using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace SmartPoweredHome.Api.Auth;

/// <summary>
/// Minimal API-key authentication.
///
/// The client sends the key via the "X-Api-Key" header (or as a
/// "access_token" query-string parameter for SignalR WebSocket connections).
///
/// The expected key is read from configuration ("Auth:ApiKey").
/// </summary>
public sealed class ApiKeyAuthHandler : AuthenticationHandler<ApiKeyAuthOptions>
{
    private const string HeaderName = "X-Api-Key";

    public ApiKeyAuthHandler(
        IOptionsMonitor<ApiKeyAuthOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder)
        : base(options, logger, encoder) { }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        // 1. Try the header first
        string? providedKey = null;
        if (Request.Headers.TryGetValue(HeaderName, out var headerValue))
        {
            providedKey = headerValue.ToString();
        }

        // 2. Fall back to query string (SignalR WebSocket connections cannot
        //    set custom headers, so they pass the key as ?access_token=…)
        if (string.IsNullOrEmpty(providedKey))
        {
            providedKey = Request.Query["access_token"];
        }

        if (string.IsNullOrEmpty(providedKey))
        {
            return Task.FromResult(AuthenticateResult.Fail("Missing API key."));
        }

        if (!string.Equals(providedKey, Options.ApiKey, StringComparison.Ordinal))
        {
            return Task.FromResult(AuthenticateResult.Fail("Invalid API key."));
        }

        var claims = new[] { new Claim(ClaimTypes.Name, "ApiClient") };
        var identity = new ClaimsIdentity(claims, Scheme.Name);
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, Scheme.Name);

        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}

public sealed class ApiKeyAuthOptions : AuthenticationSchemeOptions
{
    public string ApiKey { get; set; } = string.Empty;
}
