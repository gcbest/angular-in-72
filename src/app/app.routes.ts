import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.HomePage),
    title: 'Angular in 72 Hours — Interview Field Guide',
  },
  {
    path: 'day/:day',
    loadComponent: () => import('./pages/day/day').then((m) => m.DayPage),
    title: 'Study day — Angular in 72 Hours',
  },
  {
    path: 'cheatsheet',
    loadComponent: () =>
      import('./pages/cheatsheet/cheatsheet').then((m) => m.CheatsheetPage),
    title: 'React → Angular cheat sheet',
  },
  {
    path: 'drills',
    loadComponent: () =>
      import('./pages/drills/drills').then((m) => m.DrillsPage),
    title: 'Interview drills — Angular in 72 Hours',
  },
  { path: '**', redirectTo: '' },
];
