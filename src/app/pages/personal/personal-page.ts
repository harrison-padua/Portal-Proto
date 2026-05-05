import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { ClientStore } from '../../core/services/client-store';
import {
  ADDRESS_KINDS,
  AddressKind,
  CLIENT_STATUSES,
  Client,
  ClientStatus,
  EMPLOYMENT_STATUSES,
  EmploymentStatus,
  ENTITY_TYPES,
  EntityType,
  MARITAL_STATUSES,
  MaritalStatus,
  PHONE_KINDS,
  PhoneKind,
  RISK_PROFILES,
  RiskProfile,
  SEXES,
  Sex,
  TITLES,
  Title,
} from '../../core/models/client.model';
import { ClientPageHeader } from '../../components/page-header';

@Component({
  selector: 'app-personal-page',
  standalone: true,
  imports: [RouterLink, ClientPageHeader],
  template: `
    <div class="mx-auto max-w-6xl p-8">
      <app-client-page-header [clientId]="clientId()" section="Personal" />

      @if (working(); as w) {
        <div class="grid grid-cols-1 gap-6">
          <div class="card bg-base-100 border border-base-300">
            <div class="card-body gap-4">
              <h2 class="card-title text-lg">Identity</h2>
              <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
                <label class="form-control">
                  <span class="label-text text-sm">Title</span>
                  <select class="select select-bordered" [value]="w.title" (change)="patch({ title: any($event) })">
                    @for (t of titles; track t) {
                      <option [value]="t">{{ t }}</option>
                    }
                  </select>
                </label>
                <label class="form-control md:col-span-2">
                  <span class="label-text text-sm">Preferred name</span>
                  <input
                    class="input input-bordered"
                    [value]="w.preferredName"
                    (input)="patch({ preferredName: anyVal($event) })"
                  />
                </label>
                <label class="form-control">
                  <span class="label-text text-sm">First name<span class="text-error"> *</span></span>
                  <input
                    class="input input-bordered"
                    [value]="w.firstName"
                    (input)="patch({ firstName: anyVal($event) })"
                  />
                </label>
                <label class="form-control">
                  <span class="label-text text-sm">Middle name</span>
                  <input
                    class="input input-bordered"
                    [value]="w.middleName"
                    (input)="patch({ middleName: anyVal($event) })"
                  />
                </label>
                <label class="form-control">
                  <span class="label-text text-sm">Last name<span class="text-error"> *</span></span>
                  <input
                    class="input input-bordered"
                    [value]="w.lastName"
                    (input)="patch({ lastName: anyVal($event) })"
                  />
                </label>
                <label class="form-control">
                  <span class="label-text text-sm">Date of birth</span>
                  <input
                    type="date"
                    class="input input-bordered"
                    [value]="w.dateOfBirth"
                    (input)="patch({ dateOfBirth: anyVal($event) })"
                  />
                </label>
                <label class="form-control">
                  <span class="label-text text-sm">Sex</span>
                  <select class="select select-bordered" [value]="w.sex" (change)="patch({ sex: any($event) })">
                    @for (s of sexes; track s) {
                      <option [value]="s">{{ s }}</option>
                    }
                  </select>
                </label>
                <label class="form-control">
                  <span class="label-text text-sm">Marital status</span>
                  <select
                    class="select select-bordered"
                    [value]="w.maritalStatus"
                    (change)="patch({ maritalStatus: any($event) })"
                  >
                    @for (m of maritalStatuses; track m) {
                      <option [value]="m">{{ m }}</option>
                    }
                  </select>
                </label>
                <label class="form-control">
                  <span class="label-text text-sm">Country of residence</span>
                  <input
                    class="input input-bordered"
                    [value]="w.countryOfResidence"
                    (input)="patch({ countryOfResidence: anyVal($event) })"
                  />
                </label>
                <label class="form-control">
                  <span class="label-text text-sm">Citizenship</span>
                  <input
                    class="input input-bordered"
                    [value]="w.citizenship"
                    (input)="patch({ citizenship: anyVal($event) })"
                  />
                </label>
                <label class="form-control">
                  <span class="label-text text-sm">Tax residency</span>
                  <input
                    class="input input-bordered"
                    [value]="w.taxResidency"
                    (input)="patch({ taxResidency: anyVal($event) })"
                  />
                </label>
              </div>
            </div>
          </div>

          <div class="card bg-base-100 border border-base-300">
            <div class="card-body gap-4">
              <h2 class="card-title text-lg">Contact</h2>
              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label class="form-control md:col-span-2">
                  <span class="label-text text-sm">Email</span>
                  <input class="input input-bordered" [value]="w.email" (input)="patch({ email: anyVal($event) })" />
                </label>
              </div>

              <h3 class="text-base font-bold">Phone numbers</h3>
              @if (w.phones.length === 0) {
                <p class="text-sm text-base-content/60">No phone numbers recorded.</p>
              } @else {
                <ul class="divide-y divide-base-300">
                  @for (p of w.phones; track p.id) {
                    <li class="flex flex-wrap items-center gap-3 py-2">
                      <select
                        class="select select-bordered select-sm w-36"
                        [value]="p.kind"
                        (change)="updatePhone(p.id, { kind: any($event) })"
                      >
                        @for (k of phoneKinds; track k) {
                          <option [value]="k">{{ k }}</option>
                        }
                      </select>
                      <input
                        class="input input-bordered input-sm flex-1"
                        [value]="p.number"
                        (input)="updatePhone(p.id, { number: anyVal($event) })"
                      />
                      <button
                        class="btn btn-ghost btn-sm btn-square text-error"
                        title="Remove phone"
                        aria-label="Remove phone"
                        (click)="removePhone(p.id)"
                      >
                        <span class="material-icons icon-sm">delete</span>
                      </button>
                    </li>
                  }
                </ul>
              }
              <button class="btn btn-ghost btn-sm w-fit" (click)="addPhone()">
                <span class="material-icons icon-sm">add</span> Add phone
              </button>

              <div class="divider"></div>
              <h3 class="text-base font-bold">Addresses</h3>
              @if (w.addresses.length === 0) {
                <p class="text-sm text-base-content/60">No addresses recorded.</p>
              } @else {
                <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                  @for (a of w.addresses; track a.id) {
                    <div class="rounded-md border border-base-300 p-3">
                      <div class="mb-2 flex items-center gap-2">
                        <select
                          class="select select-bordered select-sm w-32"
                          [value]="a.kind"
                          (change)="updateAddress(a.id, { kind: any($event) })"
                        >
                          @for (k of addressKinds; track k) {
                            <option [value]="k">{{ k }}</option>
                          }
                        </select>
                        <button
                          class="btn btn-ghost btn-sm btn-square text-error ml-auto"
                          title="Remove address"
                          aria-label="Remove address"
                          (click)="removeAddress(a.id)"
                        >
                          <span class="material-icons icon-sm">delete</span>
                        </button>
                      </div>
                      <div class="grid grid-cols-1 gap-2">
                        <input
                          class="input input-bordered input-sm"
                          placeholder="Street"
                          [value]="a.street"
                          (input)="updateAddress(a.id, { street: anyVal($event) })"
                        />
                        <input
                          class="input input-bordered input-sm"
                          placeholder="Suburb"
                          [value]="a.suburb"
                          (input)="updateAddress(a.id, { suburb: anyVal($event) })"
                        />
                        <div class="grid grid-cols-3 gap-2">
                          <input
                            class="input input-bordered input-sm"
                            placeholder="State"
                            [value]="a.state"
                            (input)="updateAddress(a.id, { state: anyVal($event) })"
                          />
                          <input
                            class="input input-bordered input-sm"
                            placeholder="Postcode"
                            [value]="a.postcode"
                            (input)="updateAddress(a.id, { postcode: anyVal($event) })"
                          />
                          <input
                            class="input input-bordered input-sm"
                            placeholder="Country"
                            [value]="a.country"
                            (input)="updateAddress(a.id, { country: anyVal($event) })"
                          />
                        </div>
                      </div>
                    </div>
                  }
                </div>
              }
              <button class="btn btn-ghost btn-sm w-fit" (click)="addAddress()">
                <span class="material-icons icon-sm">add</span> Add address
              </button>
            </div>
          </div>

          <div class="card bg-base-100 border border-base-300">
            <div class="card-body gap-4">
              <h2 class="card-title text-lg">Employment</h2>
              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label class="form-control">
                  <span class="label-text text-sm">Occupation</span>
                  <input
                    class="input input-bordered"
                    [value]="w.occupation"
                    (input)="patch({ occupation: anyVal($event) })"
                  />
                </label>
                <label class="form-control">
                  <span class="label-text text-sm">Employer</span>
                  <input
                    class="input input-bordered"
                    [value]="w.employer"
                    (input)="patch({ employer: anyVal($event) })"
                  />
                </label>
                <label class="form-control">
                  <span class="label-text text-sm">Employment status</span>
                  <select
                    class="select select-bordered"
                    [value]="w.employmentStatus"
                    (change)="patch({ employmentStatus: any($event) })"
                  >
                    @for (e of employmentStatuses; track e) {
                      <option [value]="e">{{ e }}</option>
                    }
                  </select>
                </label>
                <label class="form-control">
                  <span class="label-text text-sm">Annual income</span>
                  <div class="join w-full">
                    <span class="join-item flex items-center border border-base-300 bg-base-200 px-3 text-base-content/60">$</span>
                    <input
                      type="number"
                      class="input input-bordered join-item w-full"
                      [value]="w.annualIncome"
                      (input)="patch({ annualIncome: anyNum($event) })"
                    />
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div class="card bg-base-100 border border-base-300">
            <div class="card-body gap-4">
              <h2 class="card-title text-lg">Profile & advisers</h2>
              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label class="form-control">
                  <span class="label-text text-sm">Entity type</span>
                  <select
                    class="select select-bordered"
                    [value]="w.entityType"
                    (change)="patch({ entityType: any($event) })"
                  >
                    @for (e of entityTypes; track e) {
                      <option [value]="e">{{ e }}</option>
                    }
                  </select>
                </label>
                <label class="form-control">
                  <span class="label-text text-sm">Risk profile</span>
                  <select
                    class="select select-bordered"
                    [value]="w.riskProfile"
                    (change)="patch({ riskProfile: any($event) })"
                  >
                    @for (r of riskProfiles; track r) {
                      <option [value]="r">{{ r }}</option>
                    }
                  </select>
                </label>
                <label class="form-control">
                  <span class="label-text text-sm">Status</span>
                  <select class="select select-bordered" [value]="w.status" (change)="patch({ status: any($event) })">
                    @for (s of statuses; track s) {
                      <option [value]="s">{{ s }}</option>
                    }
                  </select>
                </label>
                <label class="form-control">
                  <span class="label-text text-sm">Primary adviser</span>
                  <select
                    class="select select-bordered"
                    [value]="w.primaryAdviserId ?? ''"
                    (change)="patch({ primaryAdviserId: anyAdv($event) })"
                  >
                    <option [value]="''">Unassigned</option>
                    @for (a of store.advisers(); track a.id) {
                      <option [value]="a.id">{{ a.firstName }} {{ a.lastName }}</option>
                    }
                  </select>
                </label>
                <label class="form-control">
                  <span class="label-text text-sm">Secondary adviser</span>
                  <select
                    class="select select-bordered"
                    [value]="w.secondaryAdviserId ?? ''"
                    (change)="patch({ secondaryAdviserId: anyAdv($event) })"
                  >
                    <option [value]="''">Unassigned</option>
                    @for (a of store.advisers(); track a.id) {
                      <option [value]="a.id">{{ a.firstName }} {{ a.lastName }}</option>
                    }
                  </select>
                </label>
              </div>
            </div>
          </div>

          <div class="flex flex-col-reverse gap-2 md:flex-row md:justify-end">
            <a class="btn btn-ghost w-full md:w-auto" [routerLink]="['/client', clientId()]">Cancel</a>
            <button class="btn btn-primary w-full md:w-auto" [disabled]="!dirty()" (click)="save()">
              Save changes
            </button>
          </div>
          @if (saved()) {
            <div class="alert alert-success">
              <span class="material-icons">check_circle</span>
              <span>Personal information saved.</span>
            </div>
          }
        </div>
      } @else {
        <div class="card bg-base-100 border border-base-300">
          <div class="card-body items-center py-16 text-center">
            <h2 class="card-title text-lg">Client not found</h2>
            <a class="btn btn-primary mt-4" routerLink="/">Back to client list</a>
          </div>
        </div>
      }
    </div>
  `,
})
export class PersonalPage {
  protected readonly store = inject(ClientStore);
  private readonly route = inject(ActivatedRoute);

  protected readonly titles: Title[] = TITLES;
  protected readonly sexes: Sex[] = SEXES;
  protected readonly maritalStatuses: MaritalStatus[] = MARITAL_STATUSES;
  protected readonly employmentStatuses: EmploymentStatus[] = EMPLOYMENT_STATUSES;
  protected readonly entityTypes: EntityType[] = ENTITY_TYPES;
  protected readonly riskProfiles: RiskProfile[] = RISK_PROFILES;
  protected readonly statuses: ClientStatus[] = CLIENT_STATUSES;
  protected readonly addressKinds: AddressKind[] = ADDRESS_KINDS;
  protected readonly phoneKinds: PhoneKind[] = PHONE_KINDS;

  protected readonly clientId = toSignal(
    this.route.paramMap.pipe(map((p) => Number(p.get('id')))),
    { initialValue: 0 },
  );

  private readonly source = computed(() => this.store.getClient(this.clientId()));
  protected readonly working = signal<Client | undefined>(undefined);
  protected readonly dirty = signal(false);
  protected readonly saved = signal(false);

  constructor() {
    // Sync working state when source client changes (e.g., on initial load).
    let lastId = 0;
    effectIfChanged(() => this.source(), (client) => {
      if (client && client.id !== lastId) {
        lastId = client.id;
        this.working.set(JSON.parse(JSON.stringify(client)));
        this.dirty.set(false);
      }
    });
  }

  protected patch(p: Partial<Client>): void {
    const w = this.working();
    if (!w) return;
    this.working.set({ ...w, ...p });
    this.dirty.set(true);
    this.saved.set(false);
  }

  protected updatePhone(id: string, p: Partial<{ kind: PhoneKind; number: string }>): void {
    const w = this.working();
    if (!w) return;
    this.working.set({
      ...w,
      phones: w.phones.map((ph) => (ph.id === id ? { ...ph, ...p } : ph)),
    });
    this.dirty.set(true);
  }

  protected removePhone(id: string): void {
    const w = this.working();
    if (!w) return;
    this.working.set({ ...w, phones: w.phones.filter((p) => p.id !== id) });
    this.dirty.set(true);
  }

  protected addPhone(): void {
    const w = this.working();
    if (!w) return;
    this.working.set({
      ...w,
      phones: [...w.phones, { id: `p-new-${Date.now()}`, kind: 'mobile', number: '' }],
    });
    this.dirty.set(true);
  }

  protected updateAddress(id: string, p: Partial<{ kind: AddressKind; street: string; suburb: string; state: string; postcode: string; country: string }>): void {
    const w = this.working();
    if (!w) return;
    this.working.set({
      ...w,
      addresses: w.addresses.map((a) => (a.id === id ? { ...a, ...p } : a)),
    });
    this.dirty.set(true);
  }

  protected removeAddress(id: string): void {
    const w = this.working();
    if (!w) return;
    this.working.set({ ...w, addresses: w.addresses.filter((a) => a.id !== id) });
    this.dirty.set(true);
  }

  protected addAddress(): void {
    const w = this.working();
    if (!w) return;
    this.working.set({
      ...w,
      addresses: [
        ...w.addresses,
        {
          id: `a-new-${Date.now()}`,
          kind: 'residential',
          street: '',
          suburb: '',
          state: '',
          postcode: '',
          country: 'Australia',
        },
      ],
    });
    this.dirty.set(true);
  }

  protected save(): void {
    const w = this.working();
    if (!w) return;
    this.store.updateClient(w);
    this.dirty.set(false);
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 2500);
  }

  // Template helpers — Angular @if/@for templates handle event values as `any`.
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
  protected anyAdv(ev: Event): number | null {
    const v = (ev.target as HTMLSelectElement).value;
    return v === '' ? null : Number(v);
  }
}

import { effect } from '@angular/core';

function effectIfChanged<T>(getter: () => T, run: (value: T) => void): void {
  let last: T | undefined;
  effect(() => {
    const v = getter();
    if (v !== last) {
      last = v;
      run(v);
    }
  });
}
