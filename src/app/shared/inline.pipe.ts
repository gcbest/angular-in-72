import { Pipe, PipeTransform } from '@angular/core';
import { escapeHtml } from './highlight';

@Pipe({ name: 'inline' })
export class InlinePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    return escapeHtml(value)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  }
}
