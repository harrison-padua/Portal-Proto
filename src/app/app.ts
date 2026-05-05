import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Shell } from './shell/shell';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Shell],
  template: `
    <app-shell>
      <router-outlet />
    </app-shell>
  `,
})
export class App {}
