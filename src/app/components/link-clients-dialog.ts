import { Component, ElementRef, ViewChild, computed, inject, input, signal } from '@angular/core';
import { ClientStore } from '../core/services/client-store';
import { RELATIONSHIP_TYPES, RelationshipType } from '../core/models/relationship.model';

@Component({
  selector: 'app-link-clients-dialog',
  standalone: true,
  template: `
    <button class="btn btn-primary btn-sm" (click)="open()">
      <span class="material-icons icon-sm">link</span>
      Link client
    </button>

    <dialog #dlg class="modal">
      <div class="modal-box max-w-lg">
        <h3 class="text-lg font-semibold">Link a related client</h3>
        <p class="mt-1 text-sm text-base-content/60">
          Search for an existing client and choose how they relate to {{ clientName() }}.
        </p>

        <div class="mt-4 flex flex-col gap-4">
          <div class="form-control w-full">
            <label class="label"><span class="text-sm">Search clients</span></label>
            <input
              type="text"
              class="input input-bordered w-full"
              placeholder="Type a name…"
              [value]="query()"
              (input)="setQuery($event)"
            />
          </div>

          @if (query()) {
            <div class="max-h-48 overflow-y-auto rounded-md border border-base-300">
              @if (results().length === 0) {
                <div class="p-4 text-center text-sm text-base-content/40">No matches.</div>
              }
              @for (c of results(); track c.id) {
                <button
                  type="button"
                  class="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-base-200"
                  [class.bg-base-200]="selectedId() === c.id"
                  (click)="selectClient(c.id)"
                >
                  <span>
                    <span class="font-medium">{{ c.firstName }} {{ c.lastName }}</span>
                    <span class="ml-2 text-xs text-base-content/50">{{ c.entityType }}</span>
                  </span>
                  @if (selectedId() === c.id) {
                    <span class="material-icons icon-sm text-primary">check_circle</span>
                  }
                </button>
              }
            </div>
          }

          <div class="form-control w-full">
            <label class="label"><span class="text-sm">Relationship type</span></label>
            <select class="select select-bordered w-full" [value]="type()" (change)="setType($event)">
              @for (t of relationshipTypes; track t) {
                <option [value]="t">{{ t }}</option>
              }
            </select>
          </div>

          @if (type() === 'Dependent') {
            <div class="form-control w-full">
              <label class="label"><span class="text-sm">Dependent kind</span></label>
              <select class="select select-bordered w-full" [value]="dependentKind()" (change)="setDependentKind($event)">
                <option value="Child">Child</option>
                <option value="Other">Other</option>
              </select>
            </div>
          }
        </div>

        <div class="mt-6 flex justify-end gap-2">
          <button class="btn btn-ghost btn-sm" (click)="cancel()">Cancel</button>
          <button class="btn btn-primary btn-sm" [disabled]="!selectedId()" (click)="save()">Link</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop"><button>close</button></form>
    </dialog>
  `,
})
export class LinkClientsDialog {
  protected readonly store = inject(ClientStore);

  readonly clientId = input.required<number>();
  readonly clientName = input.required<string>();

  protected readonly relationshipTypes = RELATIONSHIP_TYPES;
  protected readonly query = signal('');
  protected readonly selectedId = signal<number | null>(null);
  protected readonly type = signal<RelationshipType>('Spouse');
  protected readonly dependentKind = signal<'Child' | 'Other'>('Child');

  protected readonly results = computed(() => this.store.searchClientsByName(this.query(), this.clientId()).slice(0, 8));

  @ViewChild('dlg', { static: true }) dialogRef!: ElementRef<HTMLDialogElement>;

  open(): void {
    this.query.set('');
    this.selectedId.set(null);
    this.type.set('Spouse');
    this.dependentKind.set('Child');
    this.dialogRef.nativeElement.showModal();
  }

  cancel(): void {
    this.dialogRef.nativeElement.close();
  }

  save(): void {
    const other = this.selectedId();
    if (other == null) return;
    this.store.addRelationship(
      this.clientId(),
      other,
      this.type(),
      this.type() === 'Dependent' ? this.dependentKind() : undefined,
    );
    this.dialogRef.nativeElement.close();
  }

  protected setQuery(ev: Event): void {
    this.query.set((ev.target as HTMLInputElement).value);
  }

  protected setType(ev: Event): void {
    this.type.set((ev.target as HTMLSelectElement).value as RelationshipType);
  }

  protected setDependentKind(ev: Event): void {
    this.dependentKind.set((ev.target as HTMLSelectElement).value as 'Child' | 'Other');
  }

  protected selectClient(id: number): void {
    this.selectedId.set(id);
  }
}
