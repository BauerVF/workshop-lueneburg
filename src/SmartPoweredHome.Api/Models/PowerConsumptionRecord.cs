namespace SmartPoweredHome.Api.Models;

public class PowerConsumptionRecord
{
    public int Id { get; set; }
    public int Index { get; set; }
    public string Date { get; set; } = string.Empty;
    public string Time { get; set; } = string.Empty;
    public double GlobalActivePower { get; set; }
    public double GlobalReactivePower { get; set; }
    public double Voltage { get; set; }
    public double GlobalIntensity { get; set; }
    public double SubMetering1 { get; set; }
    public double SubMetering2 { get; set; }
    public double SubMetering3 { get; set; }
}
