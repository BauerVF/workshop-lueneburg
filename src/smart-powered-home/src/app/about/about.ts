import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Card } from 'primeng/card';

/**
 * Static About page describing the Smart Powered Home application.
 */
@Component({
  selector: 'app-about',
  imports: [RouterLink, Card],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class AboutPage {}
