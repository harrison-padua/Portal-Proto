import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { ClientStore } from '../../core/services/client-store';
import { ASSET_TYPES, AssetType } from '../../core/models/capital.model';
import { ClientPageHeader } from '../../components/page-header';

@Component({
  selector: 'app-asset-form-page',
  standalone: true,
  imports: [RouterLink, ClientPageHeader],
  template: `
    <div class="mx-auto max-w-3xl p-8">
      <app-client-page-header [clientId]="clientId()" [section]="isEdit() ? 'Edit asset' : 'Add asset'" />

      <div class="card bg-base-100 border border-base-300">
        <div class="card-body gap-4">
          <h2 class="card-title text-lg">Asset details</h2>

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
              <span class="label-text text-sm">Ownership %</span>
              <div class="join w-full">
                <input
                  type="number"
                  min="0"
                  max="100"
                  class="input input-bordered join-item w-full"
                  [value]="ownershipPercentage()"
                  (input)="ownershipPercentage.set(anyNum($event))"
                />
                <span class="join-item flex items-center border border-base-300 bg-base-200 px-3 text-base-content/60">%</span>
              </div>
            </label>
            <label class="form-control">
              <span class="label-text text-sm">Current value</span>
              <div class="join w-full">
                <span class="join-item flex items-center border border-base-300 bg-base-200 px-3 text-base-content/60">$</span>
                <input
                  type="number"
                  class="input input-bordered join-item w-full"
                  [value]="currentValue()"
                  (input)="currentValue.set(anyNum($event))"
                />
              </div>
            </label>
            <label class="form-control">
              <span class="label-text text-sm">Purchase value</span>
              <div class="join w-full">
                <span class="join-item flex items-center border border-base-300 bg-base-200 px-3 text-base-content/60">$</span>
                <input
                  type="number"
                  class="input input-bordered join-item w-full"
                  [value]="purchaseValue()"
                  (input)="purchaseValue.set(anyNum($event))"
                />
              </div>
            </label>
            <label class="form-control">
              <span class="label-text text-sm">Purchase date</span>
              <input type="date" class="input input-bordered" [value]="purchaseDate()" (input)="purchaseDate.set(anyVal($event))" />
            </label>
            <label class="form-control md:col-span-2">
              <span class="label-text text-sm">Linked liability</span>
              <select
                class="select select-bordered"
                [value]="linkedLiabilityId() ?? ''"
                (change)="linkedLiabilityId.set(anyOrNull($event))"
              >
                <option [value]="''">— None —</option>
                @for (l of availableLiabilities(); track l.id) {
                  <option [value]="l.id">{{ l.name }} ({{ l.type }})</option>
                }
              </select>
              <p class="mt-1 text-xs text-base-content/40">
                Linking creates a relationship used to compute equity (asset value minus linked balance).
              </p>
            </label>
          </div>

          <div class="mt-6 flex flex-col-reverse gap-2 md:flex-row md:justify-end">
            <a class="btn btn-ghost w-full md:w-auto" [routerLink]="['/client', clientId(), 'data', 'capital']">Cancel</a>
            <button class="btn btn-primary w-full md:w-auto" (click)="save()">
              {{ isEdit() ? 'Save changes' : 'Add asset' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AssetFormPage {
  protected readonly store = inject(ClientStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly types: AssetType[] = ASSET_TYPES;

  protected readonly clientId = toSignal(
    this.route.paramMap.pipe(map((p) => Number(p.get('id')))),
    { initialValue: 0 },
  );
  protected readonly assetId = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('assetId'))),
    { initialValue: null },
  );

  protected readonly isEdit = computed(() => !!this.assetId());

  protected readonly name = signal('');
  protected readonly type = signal<AssetType>('Property');
  protected readonly currentValue = signal(0);
  protected readonly purchaseValue = signal(0);
  protected readonly purchaseDate = signal('');
  protected readonly ownershipPercentage = signal(100);
  protected readonly linkedLiabilityId = signal<string | null>(null);
  protected readonly submitted = signal(false);

  protected readonly availableLiabilities = computed(() =>
    this.store.liabilitiesForClient(this.clientId()),
  );

  private loadedFor: string | null = null;

  constructor() {
    queueMicrotask(() => {
      const id = this.assetId();
      if (id && this.loadedFor !== id) {
        const a = this.store.assets().find((x) => x.id === id);
        if (a) {
          this.name.set(a.name);
          this.type.set(a.type);
          this.currentValue.set(a.currentValue);
          this.purchaseValue.set(a.purchaseValue);
          this.purchaseDate.set(a.purchaseDate);
          this.ownershipPercentage.set(a.ownershipPercentage);
          this.linkedLiabilityId.set(a.linked_liability_id);
          this.loadedFor = id;
        }
      }
    });
  }

  protected save(): void {
    this.submitted.set(true);
    if (!this.name().trim()) return;

    const id = this.assetId();
    const base = {
      ownerClientId: this.clientId(),
      name: this.name().trim(),
      type: this.type(),
      currentValue: this.currentValue(),
      purchaseValue: this.purchaseValue(),
      purchaseDate: this.purchaseDate() || new Date().toISOString().slice(0, 10),
      ownershipPercentage: this.ownershipPercentage(),
      linked_liability_id: this.linkedLiabilityId() || null,
    };

    if (id) {
      this.store.updateAsset({ ...base, id });
    } else {
      this.store.addAsset(base);
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
  protected anyNum(ev: Event): number {
    const n = Number((ev.target as HTMLInputElement).value);
    return isNaN(n) ? 0 : n;
  }
}
