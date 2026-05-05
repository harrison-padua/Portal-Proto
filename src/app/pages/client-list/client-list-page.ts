import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ClientStore } from '../../core/services/client-store';
import {
  CLIENT_STATUSES,
  Client,
  ClientStatus,
  ENTITY_TYPES,
  EntityType,
  RISK_PROFILES,
  RiskProfile,
} from '../../core/models/client.model';
import { formatCurrency, formatDate } from '../../core/format';

type SortKey = 'name' | 'dob' | 'entityType' | 'createdAt' | 'portfolio';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 8;

@Component({
  selector: 'app-client-list-page',
  standalone: true,
  template: `
    <div class="mx-auto max-w-7xl p-8">
      <div class="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 class="text-3xl font-semibold text-base-content">Clients</h1>
          <p class="mt-1 text-sm text-base-content/60">
            Manage personal information, relationships, goals, and capital across your client book.
          </p>
        </div>
      </div>

      <div class="card bg-base-100 border border-base-300">
        <div class="card-body gap-4">
          <div class="flex flex-wrap items-end gap-3">
            <div class="form-control">
              <label class="label"><span class="text-sm">Search</span></label>
              <input
                type="text"
                placeholder="Search by name…"
                class="input input-bordered w-64"
                [value]="search()"
                (input)="onSearch($event)"
              />
            </div>
            <div class="form-control">
              <label class="label"><span class="text-sm">Entity type</span></label>
              <select class="select select-bordered" [value]="entityType()" (change)="onEntity($event)">
                <option value="">All entity types</option>
                @for (et of entityTypes; track et) {
                  <option [value]="et">{{ et }}</option>
                }
              </select>
            </div>
            <div class="form-control">
              <label class="label"><span class="text-sm">Risk profile</span></label>
              <select class="select select-bordered" [value]="risk()" (change)="onRisk($event)">
                <option value="">All risk profiles</option>
                @for (rp of riskProfiles; track rp) {
                  <option [value]="rp">{{ rp }}</option>
                }
              </select>
            </div>
            <div class="form-control">
              <label class="label"><span class="text-sm">Status</span></label>
              <select class="select select-bordered" [value]="status()" (change)="onStatus($event)">
                <option value="">All statuses</option>
                @for (s of statuses; track s) {
                  <option [value]="s">{{ s }}</option>
                }
              </select>
            </div>
            <div class="form-control">
              <label class="label"><span class="text-sm">Adviser</span></label>
              <select class="select select-bordered" [value]="adviser()" (change)="onAdviser($event)">
                <option value="">All advisers</option>
                @for (a of store.advisers(); track a.id) {
                  <option [value]="a.id">{{ a.firstName }} {{ a.lastName }}</option>
                }
              </select>
            </div>
            <div class="ml-auto">
              <button class="btn btn-ghost btn-sm" (click)="clearFilters()">
                <span class="material-icons text-lg">filter_alt_off</span>
                Clear filters
              </button>
            </div>
          </div>

          @if (filtered().length === 0) {
            <div class="rounded-lg border-2 border-dashed border-base-300 p-6 text-center text-base-content/40">
              No clients match your filters.
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="table">
                <thead>
                  <tr>
                    <th>
                      <button class="flex items-center gap-1" (click)="setSort('name')">
                        Name
                        <span class="material-icons text-base">{{ sortIcon('name') }}</span>
                      </button>
                    </th>
                    <th>
                      <button class="flex items-center gap-1" (click)="setSort('dob')">
                        Date of birth
                        <span class="material-icons text-base">{{ sortIcon('dob') }}</span>
                      </button>
                    </th>
                    <th>
                      <button class="flex items-center gap-1" (click)="setSort('entityType')">
                        Entity type
                        <span class="material-icons text-base">{{ sortIcon('entityType') }}</span>
                      </button>
                    </th>
                    <th>Risk</th>
                    <th>Adviser</th>
                    <th>Status</th>
                    <th class="text-right">
                      <button class="ml-auto flex items-center gap-1" (click)="setSort('portfolio')">
                        Portfolio
                        <span class="material-icons text-base">{{ sortIcon('portfolio') }}</span>
                      </button>
                    </th>
                    <th>Links</th>
                    <th class="w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  @for (row of paged(); track row.client.id) {
                    <tr class="hover:bg-base-200 cursor-pointer group" (click)="open(row.client.id)">
                      <td class="font-medium">
                        {{ row.client.firstName }} {{ row.client.lastName }}
                        @if (row.client.preferredName && row.client.preferredName !== row.client.firstName) {
                          <span class="ml-1 text-xs text-base-content/50">"{{ row.client.preferredName }}"</span>
                        }
                      </td>
                      <td>{{ formatDate(row.client.dateOfBirth) }}</td>
                      <td>
                        <span class="badge badge-soft badge-sm">{{ row.client.entityType }}</span>
                      </td>
                      <td>
                        <span class="badge badge-soft badge-sm">{{ row.client.riskProfile }}</span>
                      </td>
                      <td>{{ adviserLabel(row.client.primaryAdviserId) }}</td>
                      <td>
                        <span class="badge badge-soft badge-sm" [class]="statusBadgeClass(row.client.status)">
                          {{ row.client.status }}
                        </span>
                      </td>
                      <td class="text-right tabular-nums">{{ formatCurrency(row.portfolio) }}</td>
                      <td>
                        <span class="badge badge-soft badge-sm">{{ row.relationshipCount }}</span>
                      </td>
                      <td class="text-right">
                        <span class="material-icons icon-sm text-base-content/40 group-hover:text-base-content/80"
                          >chevron_right</span
                        >
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            @if (totalPages() > 1) {
              <div class="flex items-center justify-between pt-2">
                <span class="text-sm text-base-content/60">
                  Showing {{ rangeStart() }}–{{ rangeEnd() }} of {{ filtered().length }}
                </span>
                <div class="join">
                  <button class="btn btn-sm join-item" [disabled]="page() === 0" (click)="prev()">
                    <span class="material-icons icon-sm">chevron_left</span>
                  </button>
                  @for (p of pageNumbers(); track p) {
                    <button
                      class="btn btn-sm join-item"
                      [class.btn-primary]="p === page()"
                      (click)="goto(p)"
                    >
                      {{ p + 1 }}
                    </button>
                  }
                  <button
                    class="btn btn-sm join-item"
                    [disabled]="page() >= totalPages() - 1"
                    (click)="next()"
                  >
                    <span class="material-icons icon-sm">chevron_right</span>
                  </button>
                </div>
              </div>
            }
          }
        </div>
      </div>
    </div>
  `,
})
export class ClientListPage {
  protected readonly store = inject(ClientStore);
  private readonly router = inject(Router);

  protected readonly entityTypes = ENTITY_TYPES;
  protected readonly riskProfiles = RISK_PROFILES;
  protected readonly statuses = CLIENT_STATUSES;

  protected readonly search = signal('');
  protected readonly entityType = signal<EntityType | ''>('');
  protected readonly risk = signal<RiskProfile | ''>('');
  protected readonly status = signal<ClientStatus | ''>('');
  protected readonly adviser = signal<string>('');
  protected readonly sortKey = signal<SortKey>('name');
  protected readonly sortDir = signal<SortDir>('asc');
  protected readonly page = signal(0);

  protected readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const et = this.entityType();
    const rp = this.risk();
    const st = this.status();
    const adv = this.adviser();
    const list = this.store.clients().filter((c) => {
      if (q) {
        const name = `${c.firstName} ${c.middleName} ${c.lastName} ${c.preferredName}`.toLowerCase();
        if (!name.includes(q)) return false;
      }
      if (et && c.entityType !== et) return false;
      if (rp && c.riskProfile !== rp) return false;
      if (st && c.status !== st) return false;
      if (adv && String(c.primaryAdviserId) !== adv && String(c.secondaryAdviserId) !== adv) return false;
      return true;
    });

    const enriched = list.map((c) => ({
      client: c,
      portfolio: this.store.clientPortfolioValue(c.id),
      relationshipCount: this.store.relationshipsForClient(c.id).length,
    }));

    const dir = this.sortDir() === 'asc' ? 1 : -1;
    const key = this.sortKey();
    enriched.sort((a, b) => {
      const x = this.sortValue(a.client, a.portfolio, key);
      const y = this.sortValue(b.client, b.portfolio, key);
      if (x < y) return -1 * dir;
      if (x > y) return 1 * dir;
      return 0;
    });
    return enriched;
  });

  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / PAGE_SIZE)));

  protected readonly paged = computed(() => {
    const start = this.page() * PAGE_SIZE;
    return this.filtered().slice(start, start + PAGE_SIZE);
  });

  protected readonly rangeStart = computed(() => (this.filtered().length === 0 ? 0 : this.page() * PAGE_SIZE + 1));
  protected readonly rangeEnd = computed(() => Math.min(this.filtered().length, (this.page() + 1) * PAGE_SIZE));

  protected readonly pageNumbers = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, i) => i);
  });

  private sortValue(c: Client, portfolio: number, key: SortKey): string | number {
    switch (key) {
      case 'name':
        return `${c.lastName} ${c.firstName}`.toLowerCase();
      case 'dob':
        return c.dateOfBirth;
      case 'entityType':
        return c.entityType;
      case 'createdAt':
        return c.createdAt;
      case 'portfolio':
        return portfolio;
    }
  }

  protected setSort(key: SortKey): void {
    if (this.sortKey() === key) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortKey.set(key);
      this.sortDir.set('asc');
    }
    this.page.set(0);
  }

  protected sortIcon(key: SortKey): string {
    if (this.sortKey() !== key) return 'unfold_more';
    return this.sortDir() === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  protected open(id: number): void {
    this.router.navigate(['/client', id]);
  }

  protected onSearch(ev: Event): void {
    this.search.set((ev.target as HTMLInputElement).value);
    this.page.set(0);
  }
  protected onEntity(ev: Event): void {
    this.entityType.set((ev.target as HTMLSelectElement).value as EntityType | '');
    this.page.set(0);
  }
  protected onRisk(ev: Event): void {
    this.risk.set((ev.target as HTMLSelectElement).value as RiskProfile | '');
    this.page.set(0);
  }
  protected onStatus(ev: Event): void {
    this.status.set((ev.target as HTMLSelectElement).value as ClientStatus | '');
    this.page.set(0);
  }
  protected onAdviser(ev: Event): void {
    this.adviser.set((ev.target as HTMLSelectElement).value);
    this.page.set(0);
  }

  protected clearFilters(): void {
    this.search.set('');
    this.entityType.set('');
    this.risk.set('');
    this.status.set('');
    this.adviser.set('');
    this.page.set(0);
  }

  protected prev(): void {
    if (this.page() > 0) this.page.update((p) => p - 1);
  }

  protected next(): void {
    if (this.page() < this.totalPages() - 1) this.page.update((p) => p + 1);
  }

  protected goto(p: number): void {
    this.page.set(p);
  }

  protected adviserLabel(id: number | null): string {
    const a = this.store.adviserById(id);
    return a ? `${a.firstName} ${a.lastName}` : '—';
  }

  protected statusBadgeClass(status: ClientStatus): string {
    switch (status) {
      case 'Active':
        return 'badge-success';
      case 'Inactive':
        return 'badge-error';
      case 'Prospect':
        return 'badge-info';
    }
  }

  protected formatCurrency = formatCurrency;
  protected formatDate = formatDate;
}
