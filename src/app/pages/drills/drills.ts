import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DRILL_QUESTIONS, FLASHCARDS } from '../../core/content/drills.content';
import { DrillQuestion, Flashcard } from '../../core/content.models';
import { ProgressService } from '../../core/progress.service';
import { InlinePipe } from '../../shared/inline.pipe';

type Tab = 'cards' | 'quiz';

const QUIZ_LENGTH = 12;
const QUIZ_SECONDS = 12 * 60;

@Component({
  selector: 'app-drills',
  imports: [RouterLink, InlinePipe],
  templateUrl: './drills.html',
  styleUrl: './drills.css',
})
export class DrillsPage implements OnDestroy {
  private readonly progress = inject(ProgressService);

  readonly tab = signal<Tab>('cards');

  /* ---------- Flashcards ---------- */

  readonly categories = [
    'All',
    ...Array.from(new Set(FLASHCARDS.map((card) => card.category))),
  ];

  readonly category = signal('All');
  readonly cardIndex = signal(0);
  readonly flipped = signal(false);
  readonly order = signal<string[]>(FLASHCARDS.map((card) => card.id));

  readonly deck = computed<Flashcard[]>(() => {
    const category = this.category();
    const base =
      category === 'All'
        ? FLASHCARDS
        : FLASHCARDS.filter((card) => card.category === category);

    const positions = new Map(
      this.order().map((id, index) => [id, index] as const),
    );

    return [...base].sort(
      (a, b) => (positions.get(a.id) ?? 0) - (positions.get(b.id) ?? 0),
    );
  });

  readonly currentCard = computed(() => this.deck()[this.cardIndex()]);
  readonly knownCount = computed(
    () =>
      this.deck().filter((card) => this.progress.knownCards().has(card.id))
        .length,
  );
  readonly deckPct = computed(() =>
    this.deck().length === 0
      ? 0
      : Math.round((this.cardIndex() / this.deck().length) * 100),
  );

  setCategory(category: string): void {
    this.category.set(category);
    this.cardIndex.set(0);
    this.flipped.set(false);
  }

  flip(): void {
    this.flipped.update((value) => !value);
  }

  advance(knew: boolean): void {
    const card = this.currentCard();
    if (!card) return;

    if (knew) {
      this.progress.markCardKnown(card.id);
    }

    this.flipped.set(false);
    this.cardIndex.update((index) => index + 1);
  }

  previous(): void {
    if (this.cardIndex() === 0) return;
    this.flipped.set(false);
    this.cardIndex.update((index) => index - 1);
  }

  shuffle(): void {
    const shuffled = [...FLASHCARDS]
      .sort(() => Math.random() - 0.5)
      .map((card) => card.id);
    this.order.set(shuffled);
    this.cardIndex.set(0);
    this.flipped.set(false);
  }

  restartDeck(): void {
    this.progress.clearKnownCards();
    this.cardIndex.set(0);
    this.flipped.set(false);
  }

  /* ---------- Quiz ---------- */

  readonly quizStarted = signal(false);
  readonly quizFinished = signal(false);
  readonly quizQuestions = signal<DrillQuestion[]>([]);
  readonly quizAnswers = signal<number[]>([]);
  readonly quizIndex = signal(0);
  readonly timeLeft = signal(QUIZ_SECONDS);
  readonly best = this.progress.bestQuiz;

  private timer?: ReturnType<typeof setInterval>;

  readonly currentQuestion = computed(
    () => this.quizQuestions()[this.quizIndex()],
  );

  readonly selected = computed(() => this.quizAnswers()[this.quizIndex()]);
  readonly answered = computed(() => this.selected() !== undefined);

  readonly score = computed(() =>
    this.quizQuestions().reduce(
      (sum, question, index) =>
        sum + (this.quizAnswers()[index] === question.answer ? 1 : 0),
      0,
    ),
  );

  readonly quizPct = computed(() =>
    this.quizQuestions().length === 0
      ? 0
      : Math.round(
          ((this.quizIndex() + 1) / this.quizQuestions().length) * 100,
        ),
  );

  readonly resultMessage = computed(() => {
    const total = this.quizQuestions().length;
    const score = this.score();
    const pct = total === 0 ? 0 : (score / total) * 100;

    if (pct >= 85) {
      return 'Strong. You can explain the mechanism, not just the syntax. Do one more pass over the live-coding playbook and stop studying.';
    }
    if (pct >= 65) {
      return 'Solid foundation. Review the questions you missed, then rebuild the product search feature from memory.';
    }
    return 'Go back to the high-yield six on the dashboard. Focus on signals, DI, switchMap, and change detection before drilling again.';
  });

  startQuiz(): void {
    const questions = [...DRILL_QUESTIONS]
      .sort(() => Math.random() - 0.5)
      .slice(0, QUIZ_LENGTH);

    this.quizQuestions.set(questions);
    this.quizAnswers.set([]);
    this.quizIndex.set(0);
    this.timeLeft.set(QUIZ_SECONDS);
    this.quizStarted.set(true);
    this.quizFinished.set(false);
    this.startTimer();
  }

  answer(index: number): void {
    if (this.answered()) return;
    const answers = [...this.quizAnswers()];
    answers[this.quizIndex()] = index;
    this.quizAnswers.set(answers);
  }

  nextQuestion(): void {
    if (this.quizIndex() >= this.quizQuestions().length - 1) {
      this.finish();
      return;
    }
    this.quizIndex.update((index) => index + 1);
  }

  finish(): void {
    if (this.quizFinished()) return;
    this.stopTimer();
    this.quizFinished.set(true);
    this.progress.recordBestQuiz(this.score());
  }

  resetQuiz(): void {
    this.stopTimer();
    this.quizStarted.set(false);
    this.quizFinished.set(false);
    this.quizQuestions.set([]);
    this.quizAnswers.set([]);
    this.quizIndex.set(0);
    this.timeLeft.set(QUIZ_SECONDS);
  }

  answerText(index: number): string {
    const question = this.quizQuestions()[index];
    const choice = this.quizAnswers()[index];
    if (!question || choice === undefined) return 'No answer';
    return question.options[choice] ?? 'No answer';
  }

  correctText(index: number): string {
    const question = this.quizQuestions()[index];
    return question ? question.options[question.answer] : '';
  }

  isCorrect(index: number): boolean {
    const question = this.quizQuestions()[index];
    return question ? this.quizAnswers()[index] === question.answer : false;
  }

  letter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const rest = seconds % 60;
    return minutes + ':' + String(rest).padStart(2, '0');
  }

  private startTimer(): void {
    this.stopTimer();
    this.timer = setInterval(() => {
      this.timeLeft.update((seconds) => Math.max(0, seconds - 1));
      if (this.timeLeft() === 0) this.finish();
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }
}
