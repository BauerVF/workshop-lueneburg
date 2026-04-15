import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { ThemeSwitcher } from './theme/theme-switcher';
import { ThemeService } from './theme/theme.service';

/**
 * Root application shell. Contains the top navbar with navigation
 * icons and theme switcher, plus the router outlet for pages.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, ThemeSwitcher],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly themeService = inject(ThemeService);
}
