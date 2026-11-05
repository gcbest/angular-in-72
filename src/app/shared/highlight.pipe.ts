import { Pipe, PipeTransform } from '@angular/core';
import { escapeHtml } from './highlight';

@Pipe({ name: 'highlight' })
export class HighlightPipe implements PipeTransform {
  transform(value: string, query: string): string {
    const safe = escapeHtml(value);
    const terms = query
      .trim()
      .split(/\s+/)
      .filter((term) => term.length > 1)
      .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

    if (terms.length === 0) return safe;

    try {
      return safe.replace(new RegExp('(' + terms.join('|') + ')', 'gi'), '<mark>$1</mark>');
    } catch {
      return safe;
    }
  }
}
