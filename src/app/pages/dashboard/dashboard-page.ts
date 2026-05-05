import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ClientStore } from '../../core/services/client-store';
import { EChartComponent } from '../../components/echart';
import { formatCurrency } from '../../core/format';
import type { EChartsCoreOption } from 'echarts';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [RouterLink, EChartComponent],
  template: `
    <div class="mx-auto max-w-7xl p-8">
      <div class="mb-6">
        <h1 class="text-3xl font-semibold text-base-content">Book dashboard</h1>
        <p class="mt-1 text-sm text-base-content/60">
          Aggregate view across all {{ clientCount() }} clients in the book.
        </p>
      </div>

      <div class="grid grid-cols-1 gap-6">
        <div class="card bg-base-100 border border-base-300">
          <div class="card-body">
            <div class="stats stats-vertical md:stats-horizontal w-full">
              <div class="stat">
                <div class="stat-figure text-primary">
                  <span class="material-icons text-3xl">people</span>
                </div>
                <div class="stat-title">Clients</div>
                <div class="stat-value text-2xl">{{ clientCount() }}</div>
                <div class="stat-desc">{{ activeCount() }} active · {{ prospectCount() }} prospects</div>
              </div>
              <div class="stat">
                <div class="stat-figure text-success">
                  <span class="material-icons text-3xl">trending_up</span>
                </div>
                <div class="stat-title">Assets under advice</div>
                <div class="stat-value text-2xl">{{ formatCurrency(totalAssets()) }}</div>
                <div class="stat-desc">Across {{ assetCount() }} positions</div>
              </div>
              <div class="stat">
                <div class="stat-figure text-error">
                  <span class="material-icons text-3xl">trending_down</span>
                </div>
                <div class="stat-title">Total liabilities</div>
                <div class="stat-value text-2xl">{{ formatCurrency(totalLiabilities()) }}</div>
                <div class="stat-desc">{{ liabilityCount() }} loans/debts</div>
              </div>
              <div class="stat">
                <div class="stat-figure text-info">
                  <span class="material-icons text-3xl">account_balance</span>
                </div>
                <div class="stat-title">Net book value</div>
                <div class="stat-value text-2xl" [class.text-error]="netBook() < 0">
                  {{ formatCurrency(netBook()) }}
                </div>
                <div class="stat-desc">Assets minus liabilities</div>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div class="card bg-base-100 border border-base-300">
            <div class="card-body gap-2">
              <h2 class="card-title text-base">AUM by adviser</h2>
              <div class="h-72">
                @if (aumByAdviserData().length > 0) {
                  <app-echart [option]="aumByAdviserChart()" />
                } @else {
                  <div class="flex h-full items-center justify-center text-sm text-base-content/40">
                    No data.
                  </div>
                }
              </div>
            </div>
          </div>
          <div class="card bg-base-100 border border-base-300">
            <div class="card-body gap-2">
              <h2 class="card-title text-base">Clients by entity type</h2>
              <div class="h-72">
                <app-echart [option]="entityTypeChart()" />
              </div>
            </div>
          </div>
          <div class="card bg-base-100 border border-base-300">
            <div class="card-body gap-2">
              <h2 class="card-title text-base">Clients by risk profile</h2>
              <div class="h-72">
                <app-echart [option]="riskProfileChart()" />
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div class="card bg-base-100 border border-base-300">
            <div class="card-body gap-3">
              <div class="flex items-center justify-between">
                <h2 class="card-title text-base">Top clients by portfolio</h2>
                <span class="badge badge-soft badge-sm">Top {{ topClients().length }}</span>
              </div>
              @if (topClients().length === 0) {
                <p class="text-sm text-base-content/60">No clients with portfolio data.</p>
              } @else {
                <ul class="divide-y divide-base-300">
                  @for (row of topClients(); track row.id; let i = $index) {
                    <li class="flex items-center justify-between gap-3 py-3">
                      <div class="flex items-center gap-3">
                        <div class="flex h-8 w-8 items-center justify-center rounded-full bg-base-200 text-xs font-semibold text-base-content/60">
                          {{ i + 1 }}
                        </div>
                        <div class="flex flex-col leading-tight">
                          <a [routerLink]="['/client', row.id]" class="text-sm font-medium link link-hover">
                            {{ row.name }}
                          </a>
                          <span class="text-xs text-base-content/50">{{ row.entityType }} · {{ row.riskProfile }}</span>
                        </div>
                      </div>
                      <span class="font-medium tabular-nums">{{ formatCurrency(row.portfolio) }}</span>
                    </li>
                  }
                </ul>
              }
            </div>
          </div>

          <div class="card bg-base-100 border border-base-300">
            <div class="card-body gap-3">
              <div class="flex items-center justify-between">
                <h2 class="card-title text-base">
                  Goals needing attention
                  @if (atRiskGoals().length > 0) {
                    <span class="badge badge-soft badge-warning badge-sm ml-2">{{ atRiskGoals().length }}</span>
                  }
                </h2>
              </div>
              @if (atRiskGoals().length === 0) {
                <p class="text-sm text-base-content/60">No goals are off track or at risk.</p>
              } @else {
                <ul class="divide-y divide-base-300">
                  @for (g of atRiskGoals(); track g.id) {
                    <li class="flex items-start justify-between gap-3 py-3">
                      <div class="flex flex-col leading-tight">
                        <a [routerLink]="['/client', g.clientId, 'data', 'goals']" class="text-sm font-medium link link-hover">
                          {{ g.title }}
                        </a>
                        <span class="text-xs text-base-content/50">
                          {{ store.clientName(g.clientId) }} · {{ g.category }}
                        </span>
                      </div>
                      <span class="badge badge-soft badge-sm" [class]="statusBadge(g.status)">{{ g.status }}</span>
                    </li>
                  }
                </ul>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardPage {
  protected readonly store = inject(ClientStore);

  protected readonly clientCount = computed(() => this.store.clients().length);
  protected readonly activeCount = computed(() => this.store.clients().filter((c) => c.status === 'Active').length);
  protected readonly prospectCount = computed(() => this.store.clients().filter((c) => c.status === 'Prospect').length);
  protected readonly assetCount = computed(() => this.store.assets().length);
  protected readonly liabilityCount = computed(() => this.store.liabilities().length);

  protected readonly totalAssets = computed(() =>
    this.store.assets().reduce((s, a) => s + a.currentValue * (a.ownershipPercentage / 100), 0),
  );
  protected readonly totalLiabilities = computed(() =>
    this.store.liabilities().reduce((s, l) => s + l.currentBalance, 0),
  );
  protected readonly netBook = computed(() => this.totalAssets() - this.totalLiabilities());

  protected readonly aumByAdviserData = computed(() => {
    const totals = new Map<number, number>();
    for (const c of this.store.clients()) {
      const aum = this.store.clientGrossAssets(c.id);
      if (c.primaryAdviserId != null) {
        totals.set(c.primaryAdviserId, (totals.get(c.primaryAdviserId) ?? 0) + aum);
      }
    }
    return Array.from(totals.entries()).map(([id, value]) => {
      const a = this.store.adviserById(id);
      return { name: a ? `${a.firstName} ${a.lastName}` : 'Unassigned', value };
    });
  });

  protected readonly aumByAdviserChart = computed<EChartsCoreOption>(() => {
    const data = this.aumByAdviserData();
    return {
      tooltip: { trigger: 'axis', valueFormatter: (v: any) => formatCurrency(Number(v)) },
      grid: { left: 60, right: 20, top: 20, bottom: 40 },
      xAxis: {
        type: 'category',
        data: data.map((d) => d.name),
        axisLabel: { interval: 0, rotate: 20, fontSize: 10 },
      },
      yAxis: {
        type: 'value',
        axisLabel: { formatter: (val: number) => formatCurrency(val) },
      },
      series: [
        {
          type: 'bar',
          data: data.map((d) => d.value),
          itemStyle: { color: '#2563eb' },
        },
      ],
    };
  });

  protected readonly entityTypeChart = computed<EChartsCoreOption>(() => {
    const counts = new Map<string, number>();
    for (const c of this.store.clients()) counts.set(c.entityType, (counts.get(c.entityType) ?? 0) + 1);
    return {
      tooltip: { trigger: 'item' },
      legend: { type: 'scroll', bottom: 0, textStyle: { fontSize: 11 } },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: true,
          label: { show: false },
          data: Array.from(counts.entries()).map(([name, value]) => ({ name, value })),
        },
      ],
    };
  });

  protected readonly riskProfileChart = computed<EChartsCoreOption>(() => {
    const counts = new Map<string, number>();
    for (const c of this.store.clients()) counts.set(c.riskProfile, (counts.get(c.riskProfile) ?? 0) + 1);
    return {
      tooltip: { trigger: 'item' },
      legend: { type: 'scroll', bottom: 0, textStyle: { fontSize: 11 } },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: true,
          label: { show: false },
          data: Array.from(counts.entries()).map(([name, value]) => ({ name, value })),
        },
      ],
    };
  });

  protected readonly topClients = computed(() => {
    return this.store
      .clients()
      .map((c) => ({
        id: c.id,
        name: `${c.firstName} ${c.lastName}`,
        entityType: c.entityType,
        riskProfile: c.riskProfile,
        portfolio: this.store.clientPortfolioValue(c.id),
      }))
      .filter((r) => r.portfolio > 0)
      .sort((a, b) => b.portfolio - a.portfolio)
      .slice(0, 5);
  });

  protected readonly atRiskGoals = computed(() =>
    this.store
      .goals()
      .filter((g) => !g.completed && (g.status === 'At Risk' || g.status === 'Off Track')),
  );

  protected formatCurrency = formatCurrency;

  protected statusBadge(status: string): string {
    switch (status) {
      case 'At Risk':
        return 'badge-error';
      case 'Off Track':
        return 'badge-warning';
      default:
        return '';
    }
  }
}
