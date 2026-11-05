import { Component, computed, input } from '@angular/core';
import { CheatRow } from '../../core/content.models';
import { highlightCode } from '../highlight';

@Component({
  selector: 'app-cheat-row',
  templateUrl: './cheat-row.html',
  styleUrl: './cheat-row.css',
})
export class CheatRowView {
  readonly row = input.required<CheatRow>();

  readonly reactHtml = computed(() => highlightCode(this.row().react, 'tsx'));
  readonly angularHtml = computed(() => {
    const code = this.row().angular;
    const trimmed = code.trim();
    const isTemplate =
      trimmed.startsWith('<') ||
      /<\/[a-z]/i.test(code) ||
      /@(if|for|switch|defer|let|empty|else)\b/.test(code);
    return highlightCode(code, isTemplate ? 'html' : 'ts');
  });
}
