import {
  Component,
  ElementRef,
  OnDestroy,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { SEARCH_ENTRIES, SearchEntry } from '../../core/search-index';
import { HighlightPipe } from '../highlight.pipe';

@Component({
  selector: 'app-search-overlay',
  imports: [HighlightPipe],
  templateUrl: './search-overlay.html',
  styleUrl: './search-overlay.css',
})
export class SearchOverlay implements OnDestroy {
  readonly open = input(false);
  readonly closed = output<void>();

  private readonly router = inject(Router);
  private readonly inputEl = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  readonly query = signal('');
  readonly activeIndex = signal(0);

  readonly results = computed<SearchEntry[]>(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return SEARCH_ENTRIES.slice(0, 7);

    const terms = q.split(/\s+/).filter(Boolean);

    return SEARCH_ENTRIES.map((entry) => {
      const title = entry.title.toLowerCase();
      const context = entry.context.toLowerCase();
      const keywords = entry.keywords.toLowerCase();
      let score = 0;

      if (title === q) score += 200;
      if (title.startsWith(q)) score += 80;
      if (title.includes(q)) score += 50;
      if (context.includes(q)) score += 15;

      for (const term of terms) {
        if (title.includes(term)) score += 20;
        if (context.includes(term)) score += 6;
        if (keywords.includes(term)) score += 4;
      }

      return { entry, score };
    })
      .filter((result) => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((result) => result.entry);
  });

  constructor() {
    effect(() => {
      if (this.open()) {
        this.query.set('');
        this.activeIndex.set(0);
        document.body.style.overflow = 'hidden';
        setTimeout(() => this.inputEl()?.nativeElement.focus(), 30);
      } else {
        document.body.style.overflow = '';
      }
    });
  }

  close(): void {
    this.closed.emit();
  }

  onInput(value: string): void {
    this.query.set(value);
    this.activeIndex.set(0);
  }

  onKey(event: KeyboardEvent): void {
    const count = this.results().length;

    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeIndex.update((index) => (count === 0 ? 0 : (index + 1) % count));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeIndex.update((index) =>
        count === 0 ? 0 : (index - 1 + count) % count,
      );
      return;
    }

    if (event.key === 'Enter') {
      const entry = this.results()[this.activeIndex()];
      if (entry) this.go(entry);
    }
  }

  go(entry: SearchEntry): void {
    this.close();
    this.router.navigateByUrl(entry.url);
  }

  pad(index: number): string {
    return String(index).padStart(2, '0');
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }
}
