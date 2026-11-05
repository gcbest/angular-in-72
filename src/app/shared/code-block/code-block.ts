import { Component, OnDestroy, computed, input, signal } from '@angular/core';
import { CodeLang } from '../../core/content.models';
import { highlightCode, langLabel } from '../highlight';

@Component({
  selector: 'app-code',
  templateUrl: './code-block.html',
  styleUrl: './code-block.css',
})
export class CodeBlock implements OnDestroy {
  readonly code = input.required<string>();
  readonly lang = input<CodeLang>('ts');
  readonly title = input('');
  readonly compact = input(false);

  readonly highlighted = computed(() => highlightCode(this.code(), this.lang()));
  readonly label = computed(() => this.title() || langLabel(this.lang()));
  readonly copied = signal(false);

  private timer?: ReturnType<typeof setTimeout>;

  copy(): void {
    if (!navigator.clipboard) return;

    navigator.clipboard
      .writeText(this.code())
      .then(() => {
        this.copied.set(true);
        clearTimeout(this.timer);
        this.timer = setTimeout(() => this.copied.set(false), 1600);
      })
      .catch(() => {
        this.copied.set(false);
      });
  }

  ngOnDestroy(): void {
    clearTimeout(this.timer);
  }
}
