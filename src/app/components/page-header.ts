import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ClientStore } from '../core/services/client-store';
import { DataTabs } from './data-tabs';

@Component({
  selector: 'app-client-page-header',
  standalone: true,
  imports: [RouterLink, DataTabs],
  template: `
    @if (client(); as c) {
      <div class="mb-4 flex items-center gap-2 text-sm text-base-content/60">
        <a routerLink="/" class="link link-hover">Clients</a>
        <span class="material-icons text-sm">chevron_right</span>
        <a [routerLink]="['/client', c.id]" class="link link-hover">{{ c.firstName }} {{ c.lastName }}</a>
        <span class="material-icons text-sm">chevron_right</span>
        <span class="text-base-content">{{ section() }}</span>
      </div>

      <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold text-base-content">
            {{ c.firstName }} {{ c.lastName }} — {{ section() }}
          </h1>
          <p class="mt-1 text-sm text-base-content/60">
            {{ c.entityType }} • {{ c.riskProfile }} risk • ID #{{ c.id }}
          </p>
        </div>
        <app-data-tabs [clientId]="c.id" />
      </div>
    }
  `,
})
export class ClientPageHeader {
  private readonly store = inject(ClientStore);
  readonly clientId = input.required<number>();
  readonly section = input.required<string>();

  protected readonly client = computed(() => this.store.getClient(this.clientId()));
}
