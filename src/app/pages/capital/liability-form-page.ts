import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { ClientStore } from '../../core/services/client-store';
import { LIABILITY_TYPES, LiabilityType } from '../../core/models/capital.model';
import { ClientPageHeader } from '../../components/page-header';

@Component({
  selector: 'app-liability-form-page',
  standalone: true,
  imports: [RouterLink, ClientPageHeader],
  template: `
    <div class="mx-auto max-w-3xl p-8">
      <app-client-page-header [clientId]="clientId()" [section]="isEdit() ? 'Edit liability' : 'Add liability'" />

      <div class="card bg-base-100 border border-base-300">
        <div class="card-body gap-4">
          <h2 class="card-title text-lg">Liability details</h2>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label class="form-control md:col-span-2">
              <span class="label-text text-sm">Name<span class="text-error"> *</span></span>
              <input
                class="input input-bordered"
                [class.input-error]="submitted() && !name()"
                [value]="name()"
                (input)="name.set(anyVal($event))"
              />
              @if (submitted() && !name()) {
                <p class="mt-1 text-sm text-error">Name is required.</p>
              }
            </label>
            <label class="form-control">
              <span class="label-text text-sm">Type</span>
              <select class="select select-bordered" [value]="type()" (change)="type.set(any($event))">
                @for (t of types; track t) {
                  <option [value]="t">{{ t }}</option>
                }
              </select>
            </label>
            <label class="form-control">
              <span class="label-text text-sm">Interest rate</span>
              <div class="join w-full">
                <input
                  type="number"
                  step="0.01"
                  class="input input-bordered join-item w-full"
                  [value]="interestRate()"
                  (input)="interestRate.set(anyNum($event))"
                />
                <span class="join-item flex items-center border border-base-300 bg-base-200 px-3 text-base-content/60">%</span>
              </div>
            </label>
            <label class="form-control">
              <span class="label-text text-sm">Current balance</span>
              <div class="join w-full">
                <span class="join-item flex items-center border border-base-300 bg-base-200 px-3 text-base-content/60">$</span>
                <input
                  type="number"
                  class="input input-bordered join-item w-full"
                  [value]="currentBalance()"
                  (input)="currentBalance.set(anyNum($event))"
                />
              </div>
            </label>
            <label class="form-control">
              <span class="label-text text-sm">Original amount</span>
              <div class="join w-full">
                <span class="join-item flex items-center border border-base-300 bg-base-200 px-3 text-base-content/60">$</span>
                <input
                  type="number"
                  class="input input-bordered join-item w-full"
                  [value]="originalAmount()"
                  (input)="originalAmount.set(anyNum($event))"
                />
              </div>
            </label>
            <label class="form-control">
              <span class="label-text text-sm">Monthly payment</span>
              <div class="join w-full">
                <span class="join-item flex items-center border border-base-300 bg-base-200 px-3 text-base-content/60">$</span>
                <input
                  type="number"
                  class="input input-bordered join-item w-full"
                  [value]="monthlyPayment()"
                  (input)="monthlyPayment.set(anyNum($event))"
                />
              </div>
            </label>
            <label class="form-control">
              <span class="label-text text-sm">Start date</span>
              <input type="date" class="input input-bordered" [value]="startDate()" (input)="startDate.set(anyVal($event))" />
            </label>
            <label class="form-control">
              <span class="label-text text-sm">End date</span>
              <input type="date" class="input input-bordered" [value]="endDate() ?? ''" (input)="endDate.set(anyValOrNull($event))" />
            </label>
            <label class="form-control md:col-span-2">
              <span class="label-text text-sm">Linked asset</span>
              <select
                class="select select-bordered"
                [value]="linkedAssetId() ?? ''"
                (change)="linkedAssetId.set(anyOrNull($event))"
              >
                <option [value]="''">— None —</option>
                @for (a of availableAssets(); track a.id) {
                  <option [value]="a.id">{{ a.name }} ({{ a.type }})</option>
                }
              </select>
            </label>
          </div>

          <div class="mt-6 flex flex-col-reverse gap-2 md:flex-row md:justify-end">
            <a class="btn btn-ghost w-full md:w-auto" [routerLink]="['/client', clientId(), 'data', 'capital']">Cancel</a>
            <button class="btn btn-primary w-full md:w-auto" (click)="save()">
              {{ isEdit() ? 'Save changes' : 'Add liability' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LiabilityFormPage {
  protected readonly store = inject(ClientStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly types: LiabilityType[] = LIABILITY_TYPES;

  protected readonly clientId = toSignal(
    this.route.paramMap.pipe(map((p) => Number(p.get('id')))),
    { initialValue: 0 },
  );
  protected readonly liabilityId = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('liabilityId'))),
    { initialValue: null },
  );

  protected readonly isEdit = computed(() => !!this.liabilityId());

  protected readonly name = signal('');
  protected readonly type = signal<LiabilityType>('Mortgage');
  protected readonly currentBalance = signal(0);
  protected readonly originalAmount = signal(0);
  protected readonly interestRate = signal(0);
  protected readonly monthlyPayment = signal(0);
  protected readonly startDate = signal('');
  protected readonly endDate = signal<string | null>(null);
  protected readonly linkedAssetId = signal<string | null>(null);
  protected readonly submitted = signal(false);

  protected readonly availableAssets = computed(() => this.store.assetsForClient(this.clientId()));

  private loadedFor: string | null = null;

  constructor() {
    queueMicrotask(() => {
      const id = this.liabilityId();
      if (id && this.loadedFor !== id) {
        const l = this.store.liabilities().find((x) => x.id === id);
        if (l) {
          this.name.set(l.name);
          this.type.set(l.type);
          this.currentBalance.set(l.currentBalance);
          this.originalAmount.set(l.originalAmount);
          this.interestRate.set(l.interestRate);
          this.monthlyPayment.set(l.monthlyPayment);
          this.startDate.set(l.startDate);
          this.endDate.set(l.endDate);
          this.linkedAssetId.set(l.linked_asset_id);
          this.loadedFor = id;
        }
      }
    });
  }

  protected save(): void {
    this.submitted.set(true);
    if (!this.name().trim()) return;

    const id = this.liabilityId();
    const base = {
      ownerClientId: this.clientId(),
      name: this.name().trim(),
      type: this.type(),
      currentBalance: this.currentBalance(),
      originalAmount: this.originalAmount(),
      interestRate: this.interestRate(),
      monthlyPayment: this.monthlyPayment(),
      startDate: this.startDate() || new Date().toISOString().slice(0, 10),
      endDate: this.endDate(),
      linked_asset_id: this.linkedAssetId() || null,
    };

    if (id) {
      this.store.updateLiability({ ...base, id });
    } else {
      this.store.addLiability(base);
    }
    this.router.navigate(['/client', this.clientId(), 'data', 'capital']);
  }

  protected any(ev: Event): any {
    return (ev.target as HTMLSelectElement).value;
  }
  protected anyOrNull(ev: Event): string | null {
    const v = (ev.target as HTMLSelectElement).value;
    return v === '' ? null : v;
  }
  protected anyVal(ev: Event): string {
    return (ev.target as HTMLInputElement).value;
  }
  protected anyValOrNull(ev: Event): string | null {
    const v = (ev.target as HTMLInputElement).value;
    return v ? v : null;
  }
  protected anyNum(ev: Event): number {
    const n = Number((ev.target as HTMLInputElement).value);
    return isNaN(n) ? 0 : n;
  }
}
