import { Component, ViewChild, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { ClientStore } from '../../core/services/client-store';
import { Goal } from '../../core/models/goal.model';
import { ClientPageHeader } from '../../components/page-header';
import { CompleteGoalDialog } from '../../components/complete-goal-dialog';
import { formatCurrency, formatDate } from '../../core/format';

@Component({
  selector: 'app-goals-page',
  standalone: true,
  imports: [RouterLink, ClientPageHeader, CompleteGoalDialog],
  template: `
    <div class="mx-auto max-w-6xl p-8">
      <app-client-page-header [clientId]="clientId()" section="Goals" />

      <div class="grid grid-cols-1 gap-6">
        <div class="card bg-base-100 border border-base-300">
          <div class="card-body gap-4">
            <div class="flex items-center justify-between">
              <h2 class="card-title text-lg">
                Active goals
                <span class="badge badge-soft badge-sm ml-2">{{ activeGoals().length }}</span>
              </h2>
              <a class="btn btn-primary btn-sm" [routerLink]="['/client', clientId(), 'data', 'goals', 'add']">
                <span class="material-icons icon-sm">add</span> Add goal
              </a>
            </div>

            @if (activeGoals().length === 0) {
              <div class="rounded-lg border-2 border-dashed border-base-300 p-6 text-center text-base-content/40">
                No active goals yet. Add one to get started.
              </div>
            } @else {
              <ul class="grid grid-cols-1 gap-3 md:grid-cols-2">
                @for (g of activeGoals(); track g.id) {
                  <li class="rounded-md border border-base-300 p-4">
                    <div class="flex items-start justify-between gap-3">
                      <div>
                        <div class="flex items-center gap-2">
                          <h3 class="text-base font-semibold">{{ g.title }}</h3>
                          <span class="badge badge-soft badge-sm">{{ g.category }}</span>
                          <span class="badge badge-soft badge-sm" [class]="priorityBadge(g.priority)">{{ g.priority }}</span>
                        </div>
                        <p class="mt-1 text-sm text-base-content/60">{{ g.description }}</p>
                      </div>
                      <span class="badge badge-soft badge-sm" [class]="statusBadge(g.status)">{{ g.status }}</span>
                    </div>
                    <div class="mt-3">
                      <div class="flex items-center justify-between text-xs text-base-content/60">
                        <span>{{ formatCurrency(g.currentAmount) }} of {{ formatCurrency(g.targetAmount) }}</span>
                        <span>{{ progressPct(g) }}%</span>
                      </div>
                      <progress class="progress mt-1 w-full" [value]="progressPct(g)" max="100"></progress>
                    </div>
                    <div class="mt-3 flex items-center justify-between">
                      <span class="text-xs text-base-content/60">
                        @if (g.timeFrameMode === 'date') {
                          Target: {{ formatDate(g.targetDate) }}
                        } @else {
                          {{ g.specialDateOption }}
                        }
                      </span>
                      <div class="flex gap-1">
                        <a
                          class="btn btn-ghost btn-sm btn-square"
                          title="Edit"
                          aria-label="Edit"
                          [routerLink]="['/client', clientId(), 'data', 'goals', 'edit', g.id]"
                        >
                          <span class="material-icons icon-sm">edit</span>
                        </a>
                        <button
                          class="btn btn-ghost btn-sm btn-square"
                          title="Mark complete"
                          aria-label="Mark complete"
                          (click)="openComplete(g)"
                        >
                          <span class="material-icons icon-sm">check_circle</span>
                        </button>
                        <button
                          class="btn btn-ghost btn-sm btn-square text-error"
                          title="Delete"
                          aria-label="Delete"
                          (click)="remove(g)"
                        >
                          <span class="material-icons icon-sm">delete</span>
                        </button>
                      </div>
                    </div>
                  </li>
                }
              </ul>
            }
          </div>
        </div>

        <div class="card bg-base-100 border border-base-300">
          <div class="card-body gap-4">
            <h2 class="card-title text-lg">
              Completed goals
              <span class="badge badge-soft badge-sm ml-2">{{ completedGoals().length }}</span>
            </h2>

            @if (completedGoals().length === 0) {
              <p class="text-sm text-base-content/60">No goals have been completed yet.</p>
            } @else {
              <ul class="divide-y divide-base-300">
                @for (g of completedGoals(); track g.id) {
                  <li class="flex flex-col gap-2 py-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div class="flex items-center gap-2">
                        <h3 class="font-semibold">{{ g.title }}</h3>
                        <span class="badge badge-soft badge-success badge-sm">Completed</span>
                        <span class="badge badge-soft badge-sm">{{ g.category }}</span>
                      </div>
                      <p class="mt-1 text-sm text-base-content/60">{{ g.description }}</p>
                      @if (g.outcomeNotes) {
                        <p class="mt-1 text-sm">
                          <span class="font-medium">Outcome:</span>
                          <span class="text-base-content/70">{{ g.outcomeNotes }}</span>
                        </p>
                      }
                      <p class="mt-1 text-xs text-base-content/40">
                        Completed {{ formatDate(g.completionDate) }}
                      </p>
                    </div>
                    <div class="flex gap-1">
                      <button
                        class="btn btn-ghost btn-sm btn-square"
                        title="Reopen"
                        aria-label="Reopen"
                        (click)="reopen(g)"
                      >
                        <span class="material-icons icon-sm">undo</span>
                      </button>
                      <button
                        class="btn btn-ghost btn-sm btn-square text-error"
                        title="Delete"
                        aria-label="Delete"
                        (click)="remove(g)"
                      >
                        <span class="material-icons icon-sm">delete</span>
                      </button>
                    </div>
                  </li>
                }
              </ul>
            }
          </div>
        </div>
      </div>
    </div>

    <app-complete-goal-dialog />
  `,
})
export class GoalsPage {
  protected readonly store = inject(ClientStore);
  private readonly route = inject(ActivatedRoute);

  protected readonly clientId = toSignal(
    this.route.paramMap.pipe(map((p) => Number(p.get('id')))),
    { initialValue: 0 },
  );

  protected readonly goals = computed(() => this.store.goalsForClient(this.clientId()));
  protected readonly activeGoals = computed(() => this.goals().filter((g) => !g.completed));
  protected readonly completedGoals = computed(() => this.goals().filter((g) => g.completed));

  @ViewChild(CompleteGoalDialog) protected completeDialog!: CompleteGoalDialog;

  protected formatCurrency = formatCurrency;
  protected formatDate = formatDate;

  protected progressPct(g: Goal): number {
    if (!g.targetAmount) return 0;
    return Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
  }

  protected priorityBadge(priority: string): string {
    return priority === 'High' ? 'badge-error' : priority === 'Medium' ? 'badge-warning' : 'badge-info';
  }

  protected statusBadge(status: string): string {
    switch (status) {
      case 'On Track':
        return 'badge-success';
      case 'Off Track':
        return 'badge-warning';
      case 'At Risk':
        return 'badge-error';
      case 'In Progress':
        return 'badge-info';
      default:
        return '';
    }
  }

  protected openComplete(g: Goal): void {
    this.completeDialog.open(g);
  }

  protected reopen(g: Goal): void {
    this.store.reopenGoal(g.id);
  }

  protected remove(g: Goal): void {
    if (confirm(`Delete "${g.title}"? This cannot be undone.`)) {
      this.store.removeGoal(g.id);
    }
  }
}
