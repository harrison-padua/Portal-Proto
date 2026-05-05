import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-data-tabs',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <div role="tablist" class="tabs tabs-box w-fit">
      <a
        role="tab"
        class="tab"
        [routerLink]="['/client', clientId(), 'data', 'personal']"
        routerLinkActive="tab-active"
      >
        <span class="material-icons icon-sm mr-1">person</span>
        Personal
      </a>
      <a
        role="tab"
        class="tab"
        [routerLink]="['/client', clientId(), 'data', 'goals']"
        routerLinkActive="tab-active"
      >
        <span class="material-icons icon-sm mr-1">flag</span>
        Goals
      </a>
      <a
        role="tab"
        class="tab"
        [routerLink]="['/client', clientId(), 'data', 'capital']"
        routerLinkActive="tab-active"
      >
        <span class="material-icons icon-sm mr-1">account_balance</span>
        Capital
      </a>
    </div>
  `,
})
export class DataTabs {
  readonly clientId = input.required<number>();
}
