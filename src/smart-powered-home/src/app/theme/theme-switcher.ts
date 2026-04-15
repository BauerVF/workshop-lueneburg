import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { ThemeService, AppTheme } from '../theme/theme.service';

interface ThemeOption {
  label: string;
  value: AppTheme;
  icon: string;
}

/**
 * Dropdown-based theme switcher for Dark / Light / Wednesday themes.
 */
@Component({
  selector: 'app-theme-switcher',
  imports: [Select, FormsModule],
  template: `
    <p-select
      [options]="themes"
      [ngModel]="themeService.theme()"
      (ngModelChange)="themeService.setTheme($event)"
      optionLabel="label"
      optionValue="value"
      styleClass="theme-select"
      data-testid="theme-switcher"
    />
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
    }
  `,
})
export class ThemeSwitcher {
  readonly themeService = inject(ThemeService);

  readonly themes: ThemeOption[] = [
    { label: '🌙 Dark', value: 'dark', icon: 'pi pi-moon' },
    { label: '☀️ Light', value: 'light', icon: 'pi pi-sun' },
    { label: '🖤 Wednesday', value: 'wednesday', icon: 'pi pi-eye' },
  ];
}
