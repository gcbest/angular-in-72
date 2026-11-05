import { Component, computed, inject, signal } from '@angular/core';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { DAYS, TOTAL_LESSONS } from './core/content';
import { ProgressService } from './core/progress.service';
import { StudyDay } from './core/content.models';
import { GistSyncService } from './core/gist-sync.service';
import { ThemeService } from './core/theme.service';
import { SearchOverlay } from './shared/search-overlay/search-overlay';
import { SyncDialog } from './shared/sync-dialog/sync-dialog';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, SearchOverlay, SyncDialog],
  templateUrl: './app.html',
  styleUrl: './app.css',
  host: {
    '(document:keydown)': 'onKeydown($event)',
  },
})
export class App {
  readonly progress = inject(ProgressService);
  readonly themeService = inject(ThemeService);
  readonly sync = inject(GistSyncService);
  private readonly router = inject(Router);

  readonly days = DAYS;
  readonly totalLessons = TOTAL_LESSONS;
  readonly theme = this.themeService.theme;

  readonly searchOpen = signal(false);
  readonly menuOpen = signal(false);
  readonly syncOpen = signal(false);

  readonly completedCount = computed(() => this.progress.completed().size);
  readonly overallPct = computed(() =>
    Math.round((this.completedCount() / this.totalLessons) * 100),
  );

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: '/' },
  );

  readonly section = computed(() => {
    const url = this.url().split('#')[0];
    if (url.startsWith('/day/')) {
      const id = url.split('/')[2] ?? '';
      return 'Day ' + id.padStart(2, '0') + ' of 3';
    }
    if (url.startsWith('/cheatsheet')) return 'React → Angular';
    if (url.startsWith('/drills')) return 'Interview drills';
    return 'Three-day plan';
  });

  stats(day: StudyDay): { done: number; total: number; pct: number } {
    return this.progress.dayStats(day);
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  openSearch(): void {
    this.searchOpen.set(true);
    this.syncOpen.set(false);
    this.closeMenu();
  }

  openSync(): void {
    this.syncOpen.set(true);
    this.searchOpen.set(false);
    this.closeMenu();
  }

  reset(): void {
    if (confirm('Reset all lesson progress and quiz answers?')) {
      this.progress.reset();
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.searchOpen.update((open) => !open);
    }
    if (event.key === 'Escape') {
      this.searchOpen.set(false);
      this.syncOpen.set(false);
      this.menuOpen.set(false);
    }
  }
}
