import { Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { ClientStore } from '../core/services/client-store';
import { Goal } from '../core/models/goal.model';

@Component({
  selector: 'app-complete-goal-dialog',
  standalone: true,
  template: `
    <dialog #dlg class="modal">
      <div class="modal-box max-w-md">
        <h3 class="text-lg font-semibold">Mark goal complete</h3>
        @if (goal(); as g) {
          <p class="mt-1 text-sm text-base-content/60">{{ g.title }}</p>

          <div class="mt-4 flex flex-col gap-4">
            <label class="form-control">
              <span class="label-text text-sm">Completion date</span>
              <input
                type="date"
                class="input input-bordered w-full"
                [value]="completionDate()"
                (input)="setDate($event)"
              />
            </label>
            <label class="form-control">
              <span class="label-text text-sm">Outcome notes</span>
              <textarea
                class="textarea textarea-bordered w-full"
                rows="4"
                placeholder="What was the outcome?"
                [value]="notes()"
                (input)="setNotes($event)"
              ></textarea>
            </label>
          </div>
        }
        <div class="mt-6 flex justify-end gap-2">
          <button class="btn btn-ghost btn-sm" (click)="cancel()">Cancel</button>
          <button class="btn btn-primary btn-sm" (click)="confirm()">Mark complete</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop"><button>close</button></form>
    </dialog>
  `,
})
export class CompleteGoalDialog {
  protected readonly store = inject(ClientStore);
  protected readonly goal = signal<Goal | null>(null);
  protected readonly completionDate = signal<string>(new Date().toISOString().slice(0, 10));
  protected readonly notes = signal<string>('');

  @ViewChild('dlg', { static: true }) dialogRef!: ElementRef<HTMLDialogElement>;

  open(goal: Goal): void {
    this.goal.set(goal);
    this.completionDate.set(new Date().toISOString().slice(0, 10));
    this.notes.set('');
    this.dialogRef.nativeElement.showModal();
  }

  cancel(): void {
    this.dialogRef.nativeElement.close();
  }

  confirm(): void {
    const g = this.goal();
    if (!g) return;
    this.store.completeGoal(g.id, this.notes(), this.completionDate());
    this.dialogRef.nativeElement.close();
  }

  protected setDate(ev: Event): void {
    this.completionDate.set((ev.target as HTMLInputElement).value);
  }
  protected setNotes(ev: Event): void {
    this.notes.set((ev.target as HTMLTextAreaElement).value);
  }
}
