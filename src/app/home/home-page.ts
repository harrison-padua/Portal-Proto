import { Component } from '@angular/core';

@Component({
  selector: 'app-home-page',
  standalone: true,
  template: `
    <div class="mx-auto max-w-3xl p-8">
      <div class="card bg-base-100 border border-base-300">
        <div class="card-body gap-4">
          <h1 class="card-title text-2xl">Welcome to your prototype</h1>
          <p class="text-base-content/60">
            This is a blank Angular + Padua UI template. There's nothing built yet — that's
            on purpose. Tell Claude what you want and it will build it here, live, while you
            watch.
          </p>
          <div class="rounded-md border border-base-300 bg-base-200 p-4">
            <p class="text-sm font-medium text-base-content">Try saying:</p>
            <p class="mt-1 text-sm text-base-content/70">
              "Build a task list with checkboxes, a priority dropdown, and a button to add
              new tasks. Persist them in localStorage."
            </p>
          </div>
          <div class="card-actions justify-end pt-2">
            <a
              class="btn btn-primary"
              href="https://claude.com/claude-code"
              target="_blank"
              rel="noopener"
            >
              <span class="material-icons text-lg">auto_awesome</span>
              Open Claude
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class HomePage {}
