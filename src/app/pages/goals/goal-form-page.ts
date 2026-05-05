import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { ClientStore } from '../../core/services/client-store';
import {
  GOAL_CATEGORIES,
  GOAL_PRIORITIES,
  GOAL_STATUSES,
  GOAL_TEMPLATES,
  Goal,
  GoalCategory,
  GoalPriority,
  GoalStatus,
  SPECIAL_DATE_OPTIONS,
  SpecialDateOption,
  TimeFrameMode,
} from '../../core/models/goal.model';
import { ClientPageHeader } from '../../components/page-header';

@Component({
  selector: 'app-goal-form-page',
  standalone: true,
  imports: [RouterLink, ClientPageHeader],
  template: `
    <div class="mx-auto max-w-4xl p-8">
      <app-client-page-header [clientId]="clientId()" [section]="isEdit() ? 'Edit goal' : 'Add goal'" />

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div class="card bg-base-100 border border-base-300 lg:col-span-2">
          <div class="card-body gap-4">
            <h2 class="card-title text-lg">Goal details</h2>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label class="form-control md:col-span-2">
                <span class="label-text text-sm">Title<span class="text-error"> *</span></span>
                <input
                  class="input input-bordered"
                  [class.input-error]="submitted() && !title()"
                  [value]="title()"
                  (input)="title.set(anyVal($event))"
                />
                @if (submitted() && !title()) {
                  <p class="mt-1 text-sm text-error">Title is required.</p>
                }
              </label>
              <label class="form-control md:col-span-2">
                <span class="label-text text-sm">Description</span>
                <textarea
                  class="textarea textarea-bordered"
                  rows="3"
                  [value]="description()"
                  (input)="description.set(anyVal($event))"
                ></textarea>
              </label>
              <label class="form-control">
                <span class="label-text text-sm">Category</span>
                <select class="select select-bordered" [value]="category()" (change)="category.set(any($event))">
                  @for (c of categories; track c) {
                    <option [value]="c">{{ c }}</option>
                  }
                </select>
              </label>
              <label class="form-control">
                <span class="label-text text-sm">Priority</span>
                <select class="select select-bordered" [value]="priority()" (change)="priority.set(any($event))">
                  @for (p of priorities; track p) {
                    <option [value]="p">{{ p }}</option>
                  }
                </select>
              </label>
              <label class="form-control">
                <span class="label-text text-sm">Status</span>
                <select class="select select-bordered" [value]="status()" (change)="status.set(any($event))">
                  @for (s of statuses; track s) {
                    <option [value]="s">{{ s }}</option>
                  }
                </select>
              </label>
              <label class="form-control">
                <span class="label-text text-sm">Target amount</span>
                <div class="join w-full">
                  <span class="join-item flex items-center border border-base-300 bg-base-200 px-3 text-base-content/60">$</span>
                  <input
                    type="number"
                    class="input input-bordered join-item w-full"
                    [value]="targetAmount()"
                    (input)="targetAmount.set(anyNum($event))"
                  />
                </div>
              </label>
              <label class="form-control">
                <span class="label-text text-sm">Current amount</span>
                <div class="join w-full">
                  <span class="join-item flex items-center border border-base-300 bg-base-200 px-3 text-base-content/60">$</span>
                  <input
                    type="number"
                    class="input input-bordered join-item w-full"
                    [value]="currentAmount()"
                    (input)="currentAmount.set(anyNum($event))"
                  />
                </div>
              </label>
            </div>

            <div class="divider"></div>
            <h3 class="text-base font-bold">Time frame</h3>
            <div class="flex flex-col gap-2">
              <label class="label cursor-pointer w-fit gap-2">
                <input
                  type="radio"
                  class="radio"
                  name="time-frame"
                  [checked]="timeFrameMode() === 'date'"
                  (change)="timeFrameMode.set('date')"
                />
                <span class="label-text">Specific date</span>
              </label>
              <label class="label cursor-pointer w-fit gap-2">
                <input
                  type="radio"
                  class="radio"
                  name="time-frame"
                  [checked]="timeFrameMode() === 'special'"
                  (change)="timeFrameMode.set('special')"
                />
                <span class="label-text">Special timing option</span>
              </label>
            </div>

            @if (timeFrameMode() === 'date') {
              <label class="form-control max-w-xs">
                <span class="label-text text-sm">Target date<span class="text-error"> *</span></span>
                <input
                  type="date"
                  class="input input-bordered"
                  [class.input-error]="submitted() && !targetDate()"
                  [value]="targetDate() ?? ''"
                  (input)="targetDate.set(anyVal($event))"
                />
                @if (submitted() && !targetDate()) {
                  <p class="mt-1 text-sm text-error">A target date is required.</p>
                }
              </label>
            } @else {
              <label class="form-control max-w-xs">
                <span class="label-text text-sm">Timing option</span>
                <select
                  class="select select-bordered"
                  [value]="specialDateOption() ?? 'By Retirement'"
                  (change)="specialDateOption.set(any($event))"
                >
                  @for (opt of specialOptions; track opt) {
                    <option [value]="opt">{{ opt }}</option>
                  }
                </select>
              </label>
            }
          </div>
        </div>

        <div class="card bg-base-100 border border-base-300 lg:col-span-1">
          <div class="card-body gap-3">
            <div class="flex items-center gap-2">
              <span class="material-icons text-primary">auto_awesome</span>
              <h2 class="card-title text-base">AI assistant</h2>
            </div>
            <p class="text-sm text-base-content/60">
              Suggested templates for the <span class="font-medium">{{ category() }}</span> category. Pick one to
              prefill the title and description.
            </p>
            <ul class="flex flex-col gap-2">
              @for (t of templates(); track t.title) {
                <li>
                  <button
                    type="button"
                    class="w-full rounded-md border border-base-300 p-3 text-left text-sm transition-colors hover:border-base-content/20"
                    (click)="applyTemplate(t)"
                  >
                    <div class="font-medium">{{ t.title }}</div>
                    <div class="mt-1 text-xs text-base-content/60">{{ t.description }}</div>
                  </button>
                </li>
              }
            </ul>
            <p class="mt-2 text-xs text-base-content/40">
              These are stub suggestions for the prototype. Real AI integration would call the assistant service.
            </p>
          </div>
        </div>
      </div>

      <div class="mt-6 flex flex-col-reverse gap-2 md:flex-row md:justify-end">
        <a class="btn btn-ghost w-full md:w-auto" [routerLink]="['/client', clientId(), 'data', 'goals']">Cancel</a>
        <button class="btn btn-primary w-full md:w-auto" (click)="save()">
          {{ isEdit() ? 'Save changes' : 'Add goal' }}
        </button>
      </div>
    </div>
  `,
})
export class GoalFormPage {
  protected readonly store = inject(ClientStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly categories = GOAL_CATEGORIES;
  protected readonly priorities = GOAL_PRIORITIES;
  protected readonly statuses = GOAL_STATUSES;
  protected readonly specialOptions = SPECIAL_DATE_OPTIONS;

  protected readonly clientId = toSignal(
    this.route.paramMap.pipe(map((p) => Number(p.get('id')))),
    { initialValue: 0 },
  );
  protected readonly goalId = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('goalId'))),
    { initialValue: null },
  );

  protected readonly isEdit = computed(() => !!this.goalId());

  protected readonly title = signal('');
  protected readonly description = signal('');
  protected readonly category = signal<GoalCategory>('Retirement');
  protected readonly priority = signal<GoalPriority>('Medium');
  protected readonly status = signal<GoalStatus>('Not Started');
  protected readonly targetAmount = signal(0);
  protected readonly currentAmount = signal(0);
  protected readonly timeFrameMode = signal<TimeFrameMode>('special');
  protected readonly targetDate = signal<string | null>(null);
  protected readonly specialDateOption = signal<SpecialDateOption | null>('By Retirement');
  protected readonly submitted = signal(false);

  protected readonly templates = computed(() => GOAL_TEMPLATES[this.category()]);

  private loadedFor: string | null = null;

  constructor() {
    // Load existing goal once.
    queueMicrotask(() => {
      const id = this.goalId();
      if (id && this.loadedFor !== id) {
        const g = this.store.goals().find((x) => x.id === id);
        if (g) {
          this.title.set(g.title);
          this.description.set(g.description);
          this.category.set(g.category);
          this.priority.set(g.priority);
          this.status.set(g.status);
          this.targetAmount.set(g.targetAmount);
          this.currentAmount.set(g.currentAmount);
          this.timeFrameMode.set(g.timeFrameMode);
          this.targetDate.set(g.targetDate);
          this.specialDateOption.set(g.specialDateOption);
          this.loadedFor = id;
        }
      }
    });
  }

  protected applyTemplate(t: { title: string; description: string }): void {
    this.title.set(t.title);
    this.description.set(t.description);
  }

  protected save(): void {
    this.submitted.set(true);
    if (!this.title().trim()) return;
    if (this.timeFrameMode() === 'date' && !this.targetDate()) return;

    const id = this.goalId();
    const base: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'> = {
      clientId: this.clientId(),
      title: this.title().trim(),
      description: this.description().trim(),
      category: this.category(),
      priority: this.priority(),
      status: this.status(),
      targetAmount: this.targetAmount(),
      currentAmount: this.currentAmount(),
      timeFrameMode: this.timeFrameMode(),
      targetDate: this.timeFrameMode() === 'date' ? this.targetDate() : null,
      specialDateOption: this.timeFrameMode() === 'special' ? this.specialDateOption() : null,
      completed: false,
      outcomeNotes: null,
      completionDate: null,
    };

    if (id) {
      const existing = this.store.goals().find((g) => g.id === id);
      if (existing) {
        this.store.updateGoal({ ...existing, ...base });
      }
    } else {
      this.store.addGoal(base);
    }
    this.router.navigate(['/client', this.clientId(), 'data', 'goals']);
  }

  protected any(ev: Event): any {
    return (ev.target as HTMLSelectElement).value;
  }
  protected anyVal(ev: Event): string {
    return (ev.target as HTMLInputElement).value;
  }
  protected anyNum(ev: Event): number {
    const n = Number((ev.target as HTMLInputElement).value);
    return isNaN(n) ? 0 : n;
  }
}
