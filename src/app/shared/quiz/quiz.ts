import { Component, computed, inject, input } from '@angular/core';
import { ProgressService } from '../../core/progress.service';
import { InlinePipe } from '../inline.pipe';

@Component({
  selector: 'app-quiz',
  imports: [InlinePipe],
  templateUrl: './quiz.html',
  styleUrl: './quiz.css',
})
export class Quiz {
  readonly id = input.required<string>();
  readonly question = input.required<string>();
  readonly options = input.required<string[]>();
  readonly answer = input.required<number>();
  readonly explain = input.required<string>();

  private readonly progress = inject(ProgressService);

  readonly chosen = computed(() => this.progress.quizAnswers()[this.id()]);
  readonly answered = computed(() => this.chosen() !== undefined);
  readonly correct = computed(() => this.chosen() === this.answer());

  select(index: number): void {
    if (this.answered()) return;
    this.progress.answerQuiz(this.id(), index);
  }

  letter(index: number): string {
    return String.fromCharCode(65 + index);
  }
}
