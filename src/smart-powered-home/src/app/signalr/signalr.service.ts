import { inject, Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../environments/environment';
import { PowerConsumptionRecord, PowerConsumptionService } from '../power-consumption.service';

/**
 * Manages the SignalR connection to the API's PowerConsumptionHub.
 *
 * Exposes signals so Angular components can react to real-time pushes
 * without subscribing to observables.
 *
 * Listens for:
 *   - `ReceiveRecords`    – bulk push (original)
 *   - `ReceiveNewRecord`  – single record from the 5-second simulator
 */
@Injectable({ providedIn: 'root' })
export class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private readonly powerService = inject(PowerConsumptionService);

  /** Records pushed by the server in real-time */
  readonly liveRecords = signal<PowerConsumptionRecord[]>([]);
  /** Connection status */
  readonly connected = signal(false);

  /**
   * Start (or re-start) the SignalR connection.
   * The API key is passed as a query-string parameter because WebSocket
   * upgrade requests cannot carry custom headers.
   */
  start(): void {
    if (this.connection) return;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.hubUrl}?access_token=${environment.apiKey}`)
      .withAutomaticReconnect()
      .build();

    // Listen for bulk server-pushed records
    this.connection.on('ReceiveRecords', (records: PowerConsumptionRecord[]) => {
      this.liveRecords.set(records);
    });

    // Listen for individual simulated records (every 5 s)
    this.connection.on('ReceiveNewRecord', (record: PowerConsumptionRecord) => {
      this.powerService.addRecord(record);
    });

    this.connection.onclose(() => this.connected.set(false));
    this.connection.onreconnected(() => this.connected.set(true));

    this.connection
      .start()
      .then(() => this.connected.set(true))
      .catch((err) => console.error('SignalR connection failed:', err));
  }

  /** Ask the server to push data for a specific date */
  requestDataForDate(date: string): void {
    this.connection?.invoke('RequestDataForDate', date).catch(console.error);
  }

  stop(): void {
    this.connection?.stop();
    this.connection = null;
    this.connected.set(false);
  }
}
