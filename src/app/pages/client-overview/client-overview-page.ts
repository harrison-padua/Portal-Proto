import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { ClientStore } from '../../core/services/client-store';
import { age, formatCurrency, formatDate } from '../../core/format';
import { LinkClientsDialog } from '../../components/link-clients-dialog';
import { RelationshipType } from '../../core/models/relationship.model';

@Component({
  selector: 'app-client-overview-page',
  standalone: true,
  imports: [RouterLink, LinkClientsDialog],
  template: `
    @if (client(); as c) {
      <div class="mx-auto max-w-7xl p-8">
        <div class="mb-4 flex items-center gap-2 text-sm text-base-content/60">
          <a routerLink="/" class="link link-hover">Clients</a>
          <span class="material-icons text-sm">chevron_right</span>
          <span class="text-base-content">{{ c.firstName }} {{ c.lastName }}</span>
        </div>

        <div class="card bg-base-100 border border-base-300">
          <div class="card-body gap-4">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div class="flex items-start gap-4">
                <div class="avatar avatar-placeholder">
                  <div class="w-16 rounded-full bg-base-200 text-base-content">
                    <span class="text-lg font-medium">{{ initials(c.firstName, c.lastName) }}</span>
                  </div>
                </div>
                <div class="flex flex-col gap-1">
                  <div class="flex items-center gap-2">
                    <h1 class="text-2xl font-semibold text-base-content">
                      {{ c.title }} {{ c.firstName }} {{ c.lastName }}
                    </h1>
                    <span class="badge badge-soft badge-sm" [class]="statusBadgeClass(c.status)">{{ c.status }}</span>
                  </div>
                  <div class="flex flex-wrap items-center gap-3 text-sm text-base-content/60">
                    <span>ID #{{ c.id }}</span>
                    <span>•</span>
                    <span>{{ c.entityType }}</span>
                    <span>•</span>
                    <span>{{ c.riskProfile }} risk</span>
                    @if (ageValue(c.dateOfBirth) != null) {
                      <span>•</span>
                      <span>{{ ageValue(c.dateOfBirth) }} years old</span>
                    }
                  </div>
                  <div class="mt-1 flex flex-wrap items-center gap-3 text-sm text-base-content/60">
                    @if (c.email) {
                      <span class="inline-flex items-center gap-1">
                        <span class="material-icons text-sm">mail</span>{{ c.email }}
                      </span>
                    }
                    @for (p of c.phones; track p.id) {
                      <span class="inline-flex items-center gap-1">
                        <span class="material-icons text-sm">phone</span>{{ p.number }}
                        <span class="text-base-content/40">({{ p.kind }})</span>
                      </span>
                    }
                  </div>
                </div>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <a class="btn btn-ghost btn-sm" [routerLink]="['/client', c.id, 'data', 'personal']">
                  <span class="material-icons icon-sm">person</span> Personal
                </a>
                <a class="btn btn-ghost btn-sm" [routerLink]="['/client', c.id, 'data', 'goals']">
                  <span class="material-icons icon-sm">flag</span> Goals
                </a>
                <a class="btn btn-ghost btn-sm" [routerLink]="['/client', c.id, 'data', 'capital']">
                  <span class="material-icons icon-sm">account_balance</span> Capital
                </a>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div class="card bg-base-100 border border-base-300 lg:col-span-1">
            <div class="card-body gap-4">
              <h2 class="card-title text-lg">Portfolio</h2>
              <div class="stats stats-vertical">
                <div class="stat px-0">
                  <div class="stat-title">Personal net worth</div>
                  <div class="stat-value text-2xl">{{ formatCurrency(personalNetWorth()) }}</div>
                  <div class="stat-desc">
                    Assets {{ formatCurrency(personalAssets()) }} – Liabilities
                    {{ formatCurrency(personalLiabilities()) }}
                  </div>
                </div>
                <div class="stat px-0">
                  <div class="stat-title">Family portfolio</div>
                  <div class="stat-value text-2xl">{{ formatCurrency(familyNetWorth()) }}</div>
                  <div class="stat-desc">Across {{ familyMemberCount() }} connected clients</div>
                </div>
                <div class="stat px-0">
                  <div class="stat-title">Active goals</div>
                  <div class="stat-value text-2xl">{{ activeGoalCount() }}</div>
                  <div class="stat-desc">{{ completedGoalCount() }} completed</div>
                </div>
              </div>
            </div>
          </div>

          <div class="card bg-base-100 border border-base-300 lg:col-span-2">
            <div class="card-body gap-4">
              <div class="flex items-center justify-between">
                <h2 class="card-title text-lg">Relationships</h2>
                <app-link-clients-dialog [clientId]="c.id" [clientName]="c.firstName + ' ' + c.lastName" />
              </div>

              @if (relationships().length === 0) {
                <div class="rounded-lg border-2 border-dashed border-base-300 p-6 text-center text-base-content/40">
                  No linked clients yet.
                </div>
              } @else {
                <ul class="divide-y divide-base-300">
                  @for (r of relationships(); track r.relId) {
                    <li class="flex items-center justify-between gap-3 py-3">
                      <div class="flex items-center gap-3">
                        <div class="avatar avatar-placeholder">
                          <div class="w-9 rounded-full bg-base-200 text-base-content">
                            <span class="text-xs font-medium">{{ otherInitials(r.otherId) }}</span>
                          </div>
                        </div>
                        <div class="flex flex-col leading-tight">
                          <a [routerLink]="['/client', r.otherId]" class="text-sm font-medium link link-hover">
                            {{ store.clientName(r.otherId) }}
                          </a>
                          <span class="text-xs text-base-content/60">
                            <span class="badge badge-soft badge-sm">{{ relLabel(r.type) }}</span>
                          </span>
                        </div>
                      </div>
                      <div class="flex items-center gap-1">
                        <a class="btn btn-ghost btn-sm btn-square" title="Open" aria-label="Open" [routerLink]="['/client', r.otherId]">
                          <span class="material-icons icon-sm">open_in_new</span>
                        </a>
                        <button
                          class="btn btn-ghost btn-sm btn-square text-error"
                          title="Remove link"
                          aria-label="Remove link"
                          (click)="removeRel(r.relId)"
                        >
                          <span class="material-icons icon-sm">link_off</span>
                        </button>
                      </div>
                    </li>
                  }
                </ul>
              }

              <div class="divider"></div>
              <h3 class="text-base font-bold">Family members included in family portfolio</h3>
              <div class="flex flex-wrap gap-2">
                @for (id of familyIds(); track id) {
                  <a [routerLink]="['/client', id]" class="badge badge-soft badge-sm hover:badge-info">
                    {{ store.clientName(id) }}
                  </a>
                }
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <a [routerLink]="['/client', c.id, 'data', 'personal']" class="card bg-base-100 border border-base-300 transition-colors hover:border-base-content/20">
            <div class="card-body">
              <div class="flex items-start justify-between">
                <h2 class="card-title">Personal</h2>
                <span class="material-icons text-base-content/40">person</span>
              </div>
              <p class="text-sm text-base-content/60">
                {{ c.addresses.length }} address{{ c.addresses.length === 1 ? '' : 'es' }} •
                {{ c.phones.length }} phone{{ c.phones.length === 1 ? '' : 's' }}
              </p>
              <p class="text-xs text-base-content/40">Last updated {{ formatDate(c.updatedAt) }}</p>
            </div>
          </a>
          <a [routerLink]="['/client', c.id, 'data', 'goals']" class="card bg-base-100 border border-base-300 transition-colors hover:border-base-content/20">
            <div class="card-body">
              <div class="flex items-start justify-between">
                <h2 class="card-title">Goals</h2>
                <span class="material-icons text-base-content/40">flag</span>
              </div>
              <p class="text-sm text-base-content/60">
                {{ activeGoalCount() }} active • {{ completedGoalCount() }} completed
              </p>
            </div>
          </a>
          <a [routerLink]="['/client', c.id, 'data', 'capital']" class="card bg-base-100 border border-base-300 transition-colors hover:border-base-content/20">
            <div class="card-body">
              <div class="flex items-start justify-between">
                <h2 class="card-title">Capital</h2>
                <span class="material-icons text-base-content/40">account_balance</span>
              </div>
              <p class="text-sm text-base-content/60">
                {{ assetCount() }} assets • {{ liabilityCount() }} liabilities
              </p>
              <p class="text-xs text-base-content/40">
                Net worth {{ formatCurrency(personalNetWorth()) }}
              </p>
            </div>
          </a>
        </div>
      </div>
    } @else {
      <div class="mx-auto max-w-3xl p-8">
        <div class="card bg-base-100 border border-base-300">
          <div class="card-body items-center py-16 text-center">
            <h2 class="card-title text-lg">Client not found</h2>
            <a class="btn btn-primary mt-4" routerLink="/">Back to client list</a>
          </div>
        </div>
      </div>
    }
  `,
})
export class ClientOverviewPage {
  protected readonly store = inject(ClientStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly clientId = toSignal(
    this.route.paramMap.pipe(map((p) => Number(p.get('id')))),
    { initialValue: 0 },
  );
  protected readonly client = computed(() => this.store.getClient(this.clientId()));
  protected readonly relationships = computed(() =>
    this.client() ? this.store.linkedClients(this.client()!.id) : [],
  );
  protected readonly familyIds = computed(() =>
    this.client() ? this.store.familyClientIds(this.client()!.id) : [],
  );
  protected readonly familyMemberCount = computed(() => this.familyIds().length);
  protected readonly personalNetWorth = computed(() =>
    this.client() ? this.store.clientPortfolioValue(this.client()!.id) : 0,
  );
  protected readonly personalAssets = computed(() =>
    this.client() ? this.store.clientGrossAssets(this.client()!.id) : 0,
  );
  protected readonly personalLiabilities = computed(() =>
    this.client()
      ? this.store.liabilitiesForClient(this.client()!.id).reduce((s, l) => s + l.currentBalance, 0)
      : 0,
  );
  protected readonly familyNetWorth = computed(() =>
    this.client() ? this.store.familyPortfolioValue(this.client()!.id) : 0,
  );
  protected readonly activeGoalCount = computed(() =>
    this.client() ? this.store.goalsForClient(this.client()!.id).filter((g) => !g.completed).length : 0,
  );
  protected readonly completedGoalCount = computed(() =>
    this.client() ? this.store.goalsForClient(this.client()!.id).filter((g) => g.completed).length : 0,
  );
  protected readonly assetCount = computed(() =>
    this.client() ? this.store.assetsForClient(this.client()!.id).length : 0,
  );
  protected readonly liabilityCount = computed(() =>
    this.client() ? this.store.liabilitiesForClient(this.client()!.id).length : 0,
  );

  protected initials(first: string, last: string): string {
    return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase();
  }

  protected otherInitials(id: number): string {
    const c = this.store.getClient(id);
    return c ? this.initials(c.firstName, c.lastName) : '?';
  }

  protected ageValue = age;
  protected formatCurrency = formatCurrency;
  protected formatDate = formatDate;

  protected statusBadgeClass(status: string): string {
    switch (status) {
      case 'Active':
        return 'badge-success';
      case 'Inactive':
        return 'badge-error';
      case 'Prospect':
        return 'badge-info';
      default:
        return '';
    }
  }

  protected relLabel(type: RelationshipType): string {
    return type;
  }

  protected removeRel(relId: string): void {
    if (confirm('Remove this relationship?')) {
      this.store.removeRelationship(relId);
    }
  }
}
