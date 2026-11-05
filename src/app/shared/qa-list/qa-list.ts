import { Component, input } from '@angular/core';
import { InlinePipe } from '../inline.pipe';

@Component({
  selector: 'app-qa-list',
  imports: [InlinePipe],
  template: `
    <div class="qa-list">
      @for (item of items(); track $index) {
        <details class="qa">
          <summary>
            <span class="q">{{ item.q }}</span>
            <span class="toggle" aria-hidden="true">+</span>
          </summary>
          <div class="a inline-rich" [innerHTML]="item.a | inline"></div>
        </details>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      margin: 1.2rem 0 1.6rem;
    }

    .qa-list {
      border-top: 1px solid var(--line);
    }

    .qa {
      border-bottom: 1px solid var(--line);
    }

    summary {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.9rem 0.2rem;
      cursor: pointer;
      list-style: none;
      color: var(--text);
      font-weight: 500;
      font-size: 0.92rem;
      line-height: 1.45;
    }

    summary::-webkit-details-marker {
      display: none;
    }

    summary:hover .q {
      color: var(--accent);
    }

    .toggle {
      flex: none;
      font-family: var(--mono);
      font-size: 0.85rem;
      color: var(--text-faint);
      transition: transform 160ms ease;
    }

    details[open] .toggle {
      transform: rotate(45deg);
      color: var(--accent);
    }

    .a {
      padding: 0 2rem 1.1rem 0.2rem;
      color: var(--text-dim);
      font-size: 0.9rem;
      line-height: 1.65;
      animation: fade 180ms ease;
    }

    @media (max-width: 600px) {
      .a {
        padding-right: 0.5rem;
      }
    }
  `,
})
export class QaList {
  readonly items = input.required<{ q: string; a: string }[]>();
}
