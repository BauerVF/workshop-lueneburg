import { Component, inject, OnInit } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { PowerConsumptionService } from './power-consumption.service';

@Component({
  selector: 'app-root',
  imports: [JsonPipe],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly powerService = inject(PowerConsumptionService);

  ngOnInit(): void {
    this.powerService.load();
  }
}
