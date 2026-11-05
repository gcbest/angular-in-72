import { Injectable, computed, signal } from '@angular/core';
import { StudyDay } from './content.models';

export interface ProgressState {
  completed: string[];
  quiz: Record<string, number>;
  knownCards: string[];
  bestQuiz: number | null;
  startedAt: string | null;
  updatedAt: string | null;
}

const STORAGE_KEY = 'ng72.progress.v1';

function emptyState(): ProgressState {
  return {
    completed: [],
    quiz: {},
    knownCards: [],
    bestQuiz: null,
    startedAt: null,
    updatedAt: null,
  };
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function earliest(a: string | null, b: string | null): string | null {
  if (!a) return b;
  if (!b) return a;
  return a < b ? a : b;
}

function maxScore(a: number | null, b: number | null): number | null {
  if (a === null) return b;
  if (b === null) return a;
  return Math.max(a, b);
}

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private readonly state = signal<ProgressState>(this.load());

  /** Increments on local changes so the sync service can auto-push. */
  readonly changeTick = signal(0);

  readonly completed = computed(() => new Set(this.state().completed));
  readonly quizAnswers = computed(() => this.state().quiz);
  readonly knownCards = computed(() => new Set(this.state().knownCards));
  readonly bestQuiz = computed(() => this.state().bestQuiz);
  readonly startedAt = computed(() => this.state().startedAt);
  readonly updatedAt = computed(() => this.state().updatedAt);

  readonly snapshot = computed<ProgressState>(() => {
    const state = this.state();
    return {
      ...state,
      completed: [...state.completed],
      quiz: { ...state.quiz },
      knownCards: [...state.knownCards],
    };
  });

  isComplete(lessonId: string): boolean {
    return this.completed().has(lessonId);
  }

  toggle(lessonId: string): void {
    this.update((state) => {
      const set = new Set(state.completed);
      if (set.has(lessonId)) {
        set.delete(lessonId);
      } else {
        set.add(lessonId);
      }
      return { ...state, completed: [...set] };
    });
  }

  complete(lessonId: string): void {
    if (this.isComplete(lessonId)) return;
    this.update((state) => ({
      ...state,
      completed: unique([...state.completed, lessonId]),
    }));
  }

  answerQuiz(quizId: string, choice: number): void {
    this.update((state) => ({
      ...state,
      quiz: { ...state.quiz, [quizId]: choice },
    }));
  }

  markCardKnown(cardId: string): void {
    if (this.knownCards().has(cardId)) return;
    this.update((state) => ({
      ...state,
      knownCards: unique([...state.knownCards, cardId]),
    }));
  }

  clearKnownCards(): void {
    this.update((state) => ({ ...state, knownCards: [] }));
  }

  recordBestQuiz(score: number): void {
    const best = this.bestQuiz();
    if (best !== null && score <= best) return;

    this.update((state) => ({
      ...state,
      bestQuiz: maxScore(state.bestQuiz, score),
    }));
  }

  /**
   * Merge a remote snapshot into local state. Completion, flashcards, and the
   * best score are unioned; local quiz answers win conflicts (they are locked
   * after the first answer anyway).
   */
  mergeRemote(remote: Partial<ProgressState>): void {
    const now = new Date().toISOString();

    this.state.update((local) => {
      const merged: ProgressState = {
        completed: unique([...local.completed, ...(remote.completed ?? [])]),
        quiz: { ...(remote.quiz ?? {}), ...local.quiz },
        knownCards: unique([
          ...local.knownCards,
          ...(remote.knownCards ?? []),
        ]),
        bestQuiz: maxScore(local.bestQuiz, remote.bestQuiz ?? null),
        startedAt: earliest(local.startedAt, remote.startedAt ?? null),
        updatedAt: now,
      };
      this.persist(merged);
      return merged;
    });
  }

  reset(): void {
    const next = { ...emptyState(), updatedAt: new Date().toISOString() };
    this.state.set(next);
    this.persist(next);
    this.changeTick.update((tick) => tick + 1);
  }

  dayStats(day: StudyDay): { done: number; total: number; pct: number } {
    const completed = this.completed();
    const done = day.lessons.filter((lesson) => completed.has(lesson.id)).length;
    const total = day.lessons.length;
    return { done, total, pct: total === 0 ? 0 : Math.round((done / total) * 100) };
  }

  readonly overall = computed(() => this.completed().size);

  private update(fn: (state: ProgressState) => ProgressState): void {
    const now = new Date().toISOString();

    this.state.update((state) => {
      const next = fn(state);
      const withMeta: ProgressState = {
        ...next,
        startedAt: next.startedAt ?? now,
        updatedAt: now,
      };
      this.persist(withMeta);
      return withMeta;
    });

    this.changeTick.update((tick) => tick + 1);
  }

  private load(): ProgressState {
    if (typeof localStorage === 'undefined') return emptyState();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return emptyState();
      const parsed = JSON.parse(raw) as Partial<ProgressState>;
      return {
        completed: Array.isArray(parsed.completed)
          ? parsed.completed.filter((id): id is string => typeof id === 'string')
          : [],
        quiz:
          parsed.quiz && typeof parsed.quiz === 'object' ? parsed.quiz : {},
        knownCards: Array.isArray(parsed.knownCards)
          ? parsed.knownCards.filter((id): id is string => typeof id === 'string')
          : [],
        bestQuiz: typeof parsed.bestQuiz === 'number' ? parsed.bestQuiz : null,
        startedAt: typeof parsed.startedAt === 'string' ? parsed.startedAt : null,
        updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : null,
      };
    } catch {
      return emptyState();
    }
  }

  private persist(state: ProgressState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage can be unavailable (private mode / quota). Progress is best-effort.
    }
  }
}
