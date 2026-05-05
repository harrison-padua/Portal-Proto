import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ClientStore } from '../core/services/client-store';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <div class="flex h-screen w-full">
      <aside class="flex w-64 shrink-0 flex-col border-r border-base-300 bg-base-100">
        <div class="flex h-16 items-center gap-3 border-b border-base-300 px-5">
          <div class="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-content">
            <span class="material-icons text-xl">group</span>
          </div>
          <div class="flex flex-col leading-tight">
            <span class="text-sm font-semibold text-base-content">Padua Portal</span>
            <span class="text-xs text-base-content/60">Client Management</span>
          </div>
        </div>

        <nav class="flex-1 overflow-y-auto p-3">
          <ul class="menu menu-sm w-full gap-1">
            <li>
              <a routerLink="/dashboard" routerLinkActive="menu-active">
                <span class="material-icons text-lg">dashboard</span>
                Dashboard
              </a>
            </li>
            <li>
              <a routerLink="/" routerLinkActive="menu-active" [routerLinkActiveOptions]="{ exact: true }">
                <span class="material-icons text-lg">people</span>
                Clients
                <span class="badge badge-sm ml-auto">{{ store.clients().length }}</span>
              </a>
            </li>
          </ul>

          <div class="mt-6 px-3 text-xs font-semibold uppercase tracking-wide text-base-content/40">
            Demo
          </div>
          <ul class="menu menu-sm w-full gap-1">
            <li>
              <button (click)="reset()">
                <span class="material-icons text-lg">restart_alt</span>
                Reset mock data
              </button>
            </li>
          </ul>
        </nav>

        <div class="border-t border-base-300 p-3">
          <div class="flex items-center gap-3 rounded-md p-2">
            <div class="avatar avatar-placeholder">
              <div class="w-9 rounded-full bg-base-200 text-base-content">
                <span class="text-sm font-medium">EW</span>
              </div>
            </div>
            <div class="flex flex-col leading-tight">
              <span class="text-sm font-medium text-base-content">Eleanor Whitlock</span>
              <span class="text-xs text-base-content/60">Senior Adviser</span>
            </div>
          </div>
        </div>
      </aside>

      <main class="flex-1 overflow-y-auto bg-base-200">
        <ng-content />
      </main>
    </div>
  `,
})
export class Shell {
  protected readonly store = inject(ClientStore);

  protected reset(): void {
    if (confirm('Reset all data back to the original mock data set?')) {
      this.store.resetToSeed();
    }
  }
}
