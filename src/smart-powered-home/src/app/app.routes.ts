import { Routes } from '@angular/router';
import { DashboardPage } from './dashboard/dashboard';
import { AboutPage } from './about/about';

export const routes: Routes = [
  { path: '', component: DashboardPage },
  { path: 'about', component: AboutPage },
  { path: '**', redirectTo: '' },
];
