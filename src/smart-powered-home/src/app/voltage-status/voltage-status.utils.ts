import { PowerConsumptionRecord } from '../power-consumption.service';

/**
 * REQ-007 – Voltage status classification (pure function).
 *
 * 🟢 Green : 220–240 V (normal)
 * 🟡 Yellow: 210–220 V or 240–250 V (marginal)
 * 🔴 Red   : below 210 V or above 250 V (critical)
 */
export type VoltageStatus = 'normal' | 'marginal' | 'critical';

export interface VoltageInfo {
  voltage: number;
  status: VoltageStatus;
  label: string;
  color: string;
  icon: string;
}

export function classifyVoltage(voltage: number): VoltageInfo {
  let status: VoltageStatus;
  let label: string;
  let color: string;
  let icon: string;

  if (voltage >= 220 && voltage <= 240) {
    status = 'normal';
    label = 'Normal';
    color = '#10b981';
    icon = 'pi pi-check-circle';
  } else if ((voltage >= 210 && voltage < 220) || (voltage > 240 && voltage <= 250)) {
    status = 'marginal';
    label = 'Marginal';
    color = '#f59e0b';
    icon = 'pi pi-exclamation-triangle';
  } else {
    status = 'critical';
    label = 'Critical';
    color = '#ef4444';
    icon = 'pi pi-times-circle';
  }

  return { voltage, status, label, color, icon };
}
