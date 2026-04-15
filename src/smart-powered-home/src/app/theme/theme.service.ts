import { Injectable, signal, effect } from '@angular/core';

/**
 * Available application themes.
 *
 * - `dark`  – PrimeNG Aura dark (default)
 * - `light` – PrimeNG Aura light
 * - `wednesday` – Gothic black & white theme inspired by Netflix's "Wednesday"
 */
export type AppTheme = 'dark' | 'light' | 'wednesday';

const STORAGE_KEY = 'sph-theme';

/**
 * Manages the active UI theme. Persists the choice in `localStorage`
 * and applies the corresponding CSS class to the `<html>` element.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<AppTheme>(this.loadTheme());

  constructor() {
    // React to theme changes and apply the class to <html>
    effect(() => {
      const t = this.theme();
      const html = document.documentElement;

      // Remove all theme classes
      html.classList.remove('app-dark', 'app-light', 'app-wednesday');

      // Apply the active theme class
      switch (t) {
        case 'dark':
          html.classList.add('app-dark');
          break;
        case 'light':
          html.classList.add('app-light');
          break;
        case 'wednesday':
          html.classList.add('app-wednesday');
          break;
      }

      localStorage.setItem(STORAGE_KEY, t);
    });
  }

  /** Cycle or explicitly set the theme. */
  setTheme(theme: AppTheme): void {
    this.theme.set(theme);
  }

  private loadTheme(): AppTheme {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light' || stored === 'wednesday') {
      return stored;
    }
    return 'dark';
  }
}
