import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/client-list/client-list-page').then((m) => m.ClientListPage),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard-page').then((m) => m.DashboardPage),
  },
  {
    path: 'client/:id',
    loadComponent: () => import('./pages/client-overview/client-overview-page').then((m) => m.ClientOverviewPage),
  },
  {
    path: 'client/:id/data/personal',
    loadComponent: () => import('./pages/personal/personal-page').then((m) => m.PersonalPage),
  },
  {
    path: 'client/:id/data/goals',
    loadComponent: () => import('./pages/goals/goals-page').then((m) => m.GoalsPage),
  },
  {
    path: 'client/:id/data/goals/add',
    loadComponent: () => import('./pages/goals/goal-form-page').then((m) => m.GoalFormPage),
  },
  {
    path: 'client/:id/data/goals/edit/:goalId',
    loadComponent: () => import('./pages/goals/goal-form-page').then((m) => m.GoalFormPage),
  },
  {
    path: 'client/:id/data/capital',
    loadComponent: () => import('./pages/capital/capital-page').then((m) => m.CapitalPage),
  },
  {
    path: 'client/:id/data/capital/assets/add',
    loadComponent: () => import('./pages/capital/asset-form-page').then((m) => m.AssetFormPage),
  },
  {
    path: 'client/:id/data/capital/assets/edit/:assetId',
    loadComponent: () => import('./pages/capital/asset-form-page').then((m) => m.AssetFormPage),
  },
  {
    path: 'client/:id/data/capital/liabilities/add',
    loadComponent: () => import('./pages/capital/liability-form-page').then((m) => m.LiabilityFormPage),
  },
  {
    path: 'client/:id/data/capital/liabilities/edit/:liabilityId',
    loadComponent: () => import('./pages/capital/liability-form-page').then((m) => m.LiabilityFormPage),
  },
  { path: '**', redirectTo: '' },
];
