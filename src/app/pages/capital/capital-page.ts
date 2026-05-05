import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { ClientStore } from '../../core/services/client-store';
import { ClientPageHeader } from '../../components/page-header';
import { EChartComponent } from '../../components/echart';
import { formatCurrency, formatDate } from '../../core/format';
import { Asset, Liability } from '../../core/models/capital.model';
import type { EChartsCoreOption } from 'echarts';

type Tab = 'assets' | 'liabilities';

@Component({
  selector: 'app-capital-page',
  standalone: true,
  imports: [RouterLink, ClientPageHeader, EChartComponent],
  template: `
    <div class="mx-auto max-w-7xl p-8">
      <app-client-page-header [clientId]="clientId()" section="Capital" />

      <div class="grid grid-cols-1 gap-6">
        <div class="card bg-base-100 border border-base-300">
          <div class="card-body gap-4">
            <h2 class="card-title text-lg">Summary</h2>
            <div class="stats stats-vertical md:stats-horizontal w-full">
              <div class="stat">
                <div class="stat-title">Total assets</div>
                <div class="stat-value text-2xl">{{ formatCurrency(totalAssets()) }}</div>
                <div class="stat-desc">{{ assets().length }} record{{ assets().length === 1 ? '' : 's' }}</div>
              </div>
              <div class="stat">
                <div class="stat-title">Total liabilities</div>
                <div class="stat-value text-2xl">{{ formatCurrency(totalLiabilities()) }}</div>
                <div class="stat-desc">
                  {{ liabilities().length }} record{{ liabilities().length === 1 ? '' : 's' }}
                </div>
              </div>
              <div class="stat">
                <div class="stat-title">Net worth</div>
                <div class="stat-value text-2xl" [class.text-error]="netWorth() < 0">
                  {{ formatCurrency(netWorth()) }}
                </div>
                <div class="stat-desc">Assets minus liabilities</div>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div class="card bg-base-100 border border-base-300">
            <div class="card-body gap-2">
              <h3 class="card-title text-base">Assets by type</h3>
              <div class="h-64">
                @if (assets().length > 0) {
                  <app-echart [option]="assetsByTypeChart()" />
                } @else {
                  <div class="flex h-full items-center justify-center text-sm text-base-content/40">
                    No assets to chart.
                  </div>
                }
              </div>
            </div>
          </div>
          <div class="card bg-base-100 border border-base-300">
            <div class="card-body gap-2">
              <h3 class="card-title text-base">Liabilities by type</h3>
              <div class="h-64">
                @if (liabilities().length > 0) {
                  <app-echart [option]="liabilitiesByTypeChart()" />
                } @else {
                  <div class="flex h-full items-center justify-center text-sm text-base-content/40">
                    No liabilities to chart.
                  </div>
                }
              </div>
            </div>
          </div>
          <div class="card bg-base-100 border border-base-300">
            <div class="card-body gap-2">
              <h3 class="card-title text-base">Net worth breakdown</h3>
              <div class="h-64">
                <app-echart [option]="netWorthChart()" />
              </div>
            </div>
          </div>
        </div>

        <div class="card bg-base-100 border border-base-300">
          <div class="card-body gap-4">
            <div class="flex items-center justify-between">
              <div role="tablist" class="tabs tabs-box">
                <button role="tab" class="tab" [class.tab-active]="tab() === 'assets'" (click)="tab.set('assets')">
                  <span class="material-icons icon-sm mr-1">trending_up</span>
                  Assets
                </button>
                <button
                  role="tab"
                  class="tab"
                  [class.tab-active]="tab() === 'liabilities'"
                  (click)="tab.set('liabilities')"
                >
                  <span class="material-icons icon-sm mr-1">trending_down</span>
                  Liabilities
                </button>
              </div>
              @if (tab() === 'assets') {
                <a class="btn btn-primary btn-sm" [routerLink]="['/client', clientId(), 'data', 'capital', 'assets', 'add']">
                  <span class="material-icons icon-sm">add</span> Add asset
                </a>
              } @else {
                <a class="btn btn-primary btn-sm" [routerLink]="['/client', clientId(), 'data', 'capital', 'liabilities', 'add']">
                  <span class="material-icons icon-sm">add</span> Add liability
                </a>
              }
            </div>

            @if (tab() === 'assets') {
              @if (assets().length === 0) {
                <div class="rounded-lg border-2 border-dashed border-base-300 p-6 text-center text-base-content/40">
                  No assets recorded.
                </div>
              } @else {
                <div class="overflow-x-auto">
                  <table class="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th class="text-right">Current value</th>
                        <th class="text-right">Ownership</th>
                        <th class="text-right">Equity</th>
                        <th>Linked liability</th>
                        <th class="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (a of assets(); track a.id) {
                        <tr class="hover:bg-base-200">
                          <td class="font-medium">{{ a.name }}</td>
                          <td><span class="badge badge-soft badge-sm">{{ a.type }}</span></td>
                          <td class="text-right tabular-nums">{{ formatCurrency(a.currentValue) }}</td>
                          <td class="text-right tabular-nums">{{ a.ownershipPercentage }}%</td>
                          <td class="text-right tabular-nums" [class.text-error]="store.assetEquity(a.id) < 0">
                            {{ formatCurrency(store.assetEquity(a.id)) }}
                          </td>
                          <td>
                            @if (linkedLiability(a); as l) {
                              <span class="badge badge-soft badge-sm">{{ l.name }}</span>
                            } @else {
                              <span class="text-base-content/40 text-sm">—</span>
                            }
                          </td>
                          <td>
                            <div class="flex items-center justify-end gap-1">
                              <a
                                class="btn btn-ghost btn-sm btn-square"
                                title="Edit"
                                aria-label="Edit"
                                [routerLink]="['/client', clientId(), 'data', 'capital', 'assets', 'edit', a.id]"
                              >
                                <span class="material-icons icon-sm">edit</span>
                              </a>
                              <button
                                class="btn btn-ghost btn-sm btn-square text-error"
                                title="Delete"
                                aria-label="Delete"
                                (click)="removeAsset(a)"
                              >
                                <span class="material-icons icon-sm">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            } @else {
              @if (liabilities().length === 0) {
                <div class="rounded-lg border-2 border-dashed border-base-300 p-6 text-center text-base-content/40">
                  No liabilities recorded.
                </div>
              } @else {
                <div class="overflow-x-auto">
                  <table class="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th class="text-right">Balance</th>
                        <th class="text-right">Rate</th>
                        <th class="text-right">Monthly</th>
                        <th>End date</th>
                        <th>Linked asset</th>
                        <th class="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (l of liabilities(); track l.id) {
                        <tr class="hover:bg-base-200">
                          <td class="font-medium">{{ l.name }}</td>
                          <td><span class="badge badge-soft badge-sm">{{ l.type }}</span></td>
                          <td class="text-right tabular-nums">{{ formatCurrency(l.currentBalance) }}</td>
                          <td class="text-right tabular-nums">{{ l.interestRate }}%</td>
                          <td class="text-right tabular-nums">{{ formatCurrency(l.monthlyPayment) }}</td>
                          <td>{{ formatDate(l.endDate) }}</td>
                          <td>
                            @if (linkedAsset(l); as a) {
                              <span class="badge badge-soft badge-sm">{{ a.name }}</span>
                            } @else {
                              <span class="text-base-content/40 text-sm">—</span>
                            }
                          </td>
                          <td>
                            <div class="flex items-center justify-end gap-1">
                              <a
                                class="btn btn-ghost btn-sm btn-square"
                                title="Edit"
                                aria-label="Edit"
                                [routerLink]="['/client', clientId(), 'data', 'capital', 'liabilities', 'edit', l.id]"
                              >
                                <span class="material-icons icon-sm">edit</span>
                              </a>
                              <button
                                class="btn btn-ghost btn-sm btn-square text-error"
                                title="Delete"
                                aria-label="Delete"
                                (click)="removeLiability(l)"
                              >
                                <span class="material-icons icon-sm">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class CapitalPage {
  protected readonly store = inject(ClientStore);
  private readonly route = inject(ActivatedRoute);

  protected readonly tab = signal<Tab>('assets');

  protected readonly clientId = toSignal(
    this.route.paramMap.pipe(map((p) => Number(p.get('id')))),
    { initialValue: 0 },
  );

  protected readonly assets = computed(() => this.store.assetsForClient(this.clientId()));
  protected readonly liabilities = computed(() => this.store.liabilitiesForClient(this.clientId()));

  protected readonly totalAssets = computed(() =>
    this.assets().reduce((s, a) => s + a.currentValue * (a.ownershipPercentage / 100), 0),
  );
  protected readonly totalLiabilities = computed(() => this.liabilities().reduce((s, l) => s + l.currentBalance, 0));
  protected readonly netWorth = computed(() => this.totalAssets() - this.totalLiabilities());

  protected readonly assetsByTypeChart = computed<EChartsCoreOption>(() => {
    const groups = new Map<string, number>();
    for (const a of this.assets()) {
      const v = a.currentValue * (a.ownershipPercentage / 100);
      groups.set(a.type, (groups.get(a.type) ?? 0) + v);
    }
    return {
      tooltip: { trigger: 'item', valueFormatter: (v: any) => formatCurrency(Number(v)) },
      legend: { type: 'scroll', bottom: 0, textStyle: { fontSize: 11 } },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: true,
          label: { show: false },
          data: Array.from(groups.entries()).map(([name, value]) => ({ name, value })),
        },
      ],
    };
  });

  protected readonly liabilitiesByTypeChart = computed<EChartsCoreOption>(() => {
    const groups = new Map<string, number>();
    for (const l of this.liabilities()) {
      groups.set(l.type, (groups.get(l.type) ?? 0) + l.currentBalance);
    }
    return {
      tooltip: { trigger: 'item', valueFormatter: (v: any) => formatCurrency(Number(v)) },
      legend: { type: 'scroll', bottom: 0, textStyle: { fontSize: 11 } },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: true,
          label: { show: false },
          data: Array.from(groups.entries()).map(([name, value]) => ({ name, value })),
        },
      ],
    };
  });

  protected readonly netWorthChart = computed<EChartsCoreOption>(() => {
    return {
      tooltip: { trigger: 'axis', valueFormatter: (v: any) => formatCurrency(Number(v)) },
      grid: { left: 60, right: 20, top: 20, bottom: 30 },
      xAxis: {
        type: 'category',
        data: ['Assets', 'Liabilities', 'Net worth'],
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: (val: number) => formatCurrency(val),
        },
      },
      series: [
        {
          type: 'bar',
          data: [
            { value: this.totalAssets(), itemStyle: { color: '#16a34a' } },
            { value: this.totalLiabilities(), itemStyle: { color: '#dc2626' } },
            { value: this.netWorth(), itemStyle: { color: this.netWorth() >= 0 ? '#2563eb' : '#dc2626' } },
          ],
        },
      ],
    };
  });

  protected formatCurrency = formatCurrency;
  protected formatDate = formatDate;

  protected linkedLiability(a: Asset): Liability | undefined {
    if (!a.linked_liability_id) return undefined;
    return this.liabilities().find((l) => l.id === a.linked_liability_id);
  }
  protected linkedAsset(l: Liability): Asset | undefined {
    if (!l.linked_asset_id) return undefined;
    return this.assets().find((a) => a.id === l.linked_asset_id);
  }

  protected removeAsset(a: Asset): void {
    if (confirm(`Delete asset "${a.name}"?`)) {
      this.store.removeAsset(a.id);
    }
  }

  protected removeLiability(l: Liability): void {
    if (confirm(`Delete liability "${l.name}"?`)) {
      this.store.removeLiability(l.id);
    }
  }
}
