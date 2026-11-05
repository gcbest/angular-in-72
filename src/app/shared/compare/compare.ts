import { Component, input } from '@angular/core';
import { CodeLang } from '../../core/content.models';
import { CodeBlock } from '../code-block/code-block';

@Component({
  selector: 'app-compare',
  imports: [CodeBlock],
  template: `
    <div class="compare">
      <div class="pane react">
        <app-code [code]="react()" [lang]="lang()" [title]="reactLabel()" [compact]="true" />
      </div>
      <div class="pane angular">
        <app-code [code]="angular()" [lang]="lang()" [title]="angularLabel()" [compact]="true" />
      </div>
    </div>
    @if (caption()) {
      <p class="caption">{{ caption() }}</p>
    }
  `,
  styles: `
    :host {
      display: block;
      margin: 1.35rem 0 1.7rem;
    }

    .compare {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.7rem;
      align-items: start;
    }

    .pane {
      min-width: 0;
    }

    .pane app-code {
      margin: 0;
    }

    .caption {
      margin: 0.55rem 0 0;
      color: var(--text-faint);
      font-size: 0.78rem;
      line-height: 1.55;
      font-style: italic;
    }

    @media (max-width: 760px) {
      .compare {
        grid-template-columns: 1fr;
        gap: 0.55rem;
      }
    }
  `,
})
export class Compare {
  readonly react = input.required<string>();
  readonly angular = input.required<string>();
  readonly lang = input<CodeLang>('ts');
  readonly caption = input('');
  readonly reactLabel = input('React');
  readonly angularLabel = input('Angular');
}
