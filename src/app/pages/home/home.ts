import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DAYS, TOTAL_LESSONS, TOTAL_MINUTES } from '../../core/content';
import { ProgressService } from '../../core/progress.service';
import { CodeBlock } from '../../shared/code-block/code-block';

const REACT_HERO = `import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}`;

const ANGULAR_HERO = `import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-counter',
  template: '<button (click)="bump()">{{count()}}</button>',
})
export class Counter {
  count = signal(0);

  bump() {
    this.count.update(n => n + 1);
  }
}`;

@Component({
  selector: 'app-home',
  imports: [RouterLink, CodeBlock],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomePage {
  private readonly progress = inject(ProgressService);

  readonly days = DAYS;
  readonly totalLessons = TOTAL_LESSONS;
  readonly totalHours = Math.round(TOTAL_MINUTES / 60);

  readonly mode = signal<'react' | 'angular'>('angular');
  readonly heroCode = computed(() =>
    this.mode() === 'react' ? REACT_HERO : ANGULAR_HERO,
  );

  readonly started = computed(() => this.progress.completed().size > 0);
  readonly allComplete = computed(
    () => this.progress.completed().size >= TOTAL_LESSONS,
  );

  readonly startTarget = computed<{ commands: string[]; fragment: string }>(() => {
    for (const day of DAYS) {
      const lesson = day.lessons.find(
        (item) => !this.progress.isComplete(item.id),
      );
      if (lesson) {
        return { commands: ['/day', day.id], fragment: lesson.id };
      }
    }
    return { commands: ['/drills'], fragment: '' };
  });

  readonly startLabel = computed(() =>
    this.allComplete()
      ? 'All done — take the drills'
      : this.started()
        ? 'Continue where you left off'
        : 'Start day 01',
  );

  readonly highYield = [
    {
      num: '01',
      title: 'Signals & change detection',
      text: 'The modern reactivity model. If you understand this, the rest of Angular makes sense.',
      link: '/day/1#signals',
      cta: 'Day 01',
    },
    {
      num: '02',
      title: 'Services & dependency injection',
      text: 'How Angular shares state, HTTP, and configuration without prop drilling or context providers.',
      link: '/day/2#services-di',
      cta: 'Day 02',
    },
    {
      num: '03',
      title: 'RxJS that matters',
      text: 'Six operators cover most interview code. Know switchMap and you are ahead.',
      link: '/day/2#rxjs',
      cta: 'Day 02',
    },
    {
      num: '04',
      title: 'Routing & guards',
      text: 'Lazy routes, params as inputs, functional guards, and the stale-param trap.',
      link: '/day/2#routing',
      cta: 'Day 02',
    },
    {
      num: '05',
      title: 'Forms',
      text: 'Reactive forms are the interview default. Typed groups, validators, touched errors.',
      link: '/day/2#forms',
      cta: 'Day 02',
    },
    {
      num: '06',
      title: 'The live-coding playbook',
      text: 'A searchable list with loading, error, and empty states — the most common Karat prompt.',
      link: '/day/3#live-coding',
      cta: 'Day 03',
    },
  ];

  readonly preview = [
    { topic: 'State', react: 'useState(0)', angular: 'signal(0)' },
    { topic: 'Derived', react: 'useMemo(fn, [deps])', angular: 'computed(fn)' },
    { topic: 'Props', react: 'props.title', angular: 'input.required<string>()' },
    { topic: 'Effect', react: 'useEffect(fn, [deps])', angular: 'effect(fn)' },
    {
      topic: 'List',
      react: 'items.map(item => …)',
      angular: '@for (item of items; track item.id)',
    },
  ];

  stats(day: (typeof DAYS)[number]): { done: number; total: number; pct: number } {
    return this.progress.dayStats(day);
  }
}
