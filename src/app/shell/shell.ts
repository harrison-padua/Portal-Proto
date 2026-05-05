import { Component } from '@angular/core';

@Component({
  selector: 'app-shell',
  standalone: true,
  template: `
    <div class="flex h-screen w-full">
      <aside class="flex w-64 shrink-0 flex-col border-r border-base-300 bg-base-100">
        <div class="flex h-16 items-center gap-3 border-b border-base-300 px-5">
          <div class="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-content">
            <span class="material-icons text-xl">dashboard</span>
          </div>
          <div class="flex flex-col leading-tight">
            <span class="text-sm font-semibold text-base-content">Prototype</span>
            <span class="text-xs text-base-content/60">Padua UI</span>
          </div>
        </div>

        <nav class="flex-1 overflow-y-auto p-3">
          <ul class="menu menu-sm w-full gap-1">
            <li>
              <a class="menu-active">
                <span class="material-icons text-lg">home</span>
                Home
              </a>
            </li>
          </ul>
        </nav>

        <div class="border-t border-base-300 p-3">
          <div class="flex items-center gap-3 rounded-md p-2">
            <div class="avatar avatar-placeholder">
              <div class="w-9 rounded-full bg-base-200 text-base-content">
                <span class="text-sm font-medium">BA</span>
              </div>
            </div>
            <div class="flex flex-col leading-tight">
              <span class="text-sm font-medium text-base-content">Business Analyst</span>
              <span class="text-xs text-base-content/60">Prototype mode</span>
            </div>
          </div>
        </div>
      </aside>

      <main class="flex-1 overflow-y-auto bg-base-200">
        <ng-content />
      </main>
    </div>
  `,
})
export class Shell {}
