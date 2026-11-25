import { Component } from '@angular/core';

@Component({
  selector: 'app-loader',
  standalone: true,
  template: `<div class="fs-spinner" aria-busy="true" aria-label="Loading"></div>`,
  styles: [
    `
      .fs-spinner {
        width: 48px;
        height: 48px;
        border: 4px solid var(--fs-border);
        border-top-color: var(--fs-primary);
        border-radius: 50%;
        animation: fs-spin 0.8s linear infinite;
      }
      @keyframes fs-spin {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class LoaderComponent {}
