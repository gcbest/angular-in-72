import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { Block, CalloutTone, Lesson, QuizBlock } from '../../core/content.models';
import { ProgressService } from '../../core/progress.service';
import { CodeBlock } from '../code-block/code-block';
import { Compare } from '../compare/compare';
import { InlinePipe } from '../inline.pipe';
import { QaList } from '../qa-list/qa-list';
import { Quiz } from '../quiz/quiz';

type CodeBlockData = Extract<Block, { type: 'code' }>;
type CompareBlockData = Extract<Block, { type: 'compare' }>;
type CalloutBlockData = Extract<Block, { type: 'callout' }>;
type ListBlockData = Extract<Block, { type: 'list' }>;
type TableBlockData = Extract<Block, { type: 'table' }>;
type QaBlockData = Extract<Block, { type: 'qa' }>;
type StepsBlockData = Extract<Block, { type: 'steps' }>;

@Component({
  selector: 'app-lesson-view',
  imports: [CodeBlock, Compare, InlinePipe, QaList, Quiz],
  templateUrl: './lesson-view.html',
  styleUrl: './lesson-view.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LessonView {
  readonly lesson = input.required<Lesson>();
  readonly dayId = input.required<string>();
  readonly index = input.required<number>();

  private readonly progress = inject(ProgressService);

  readonly done = computed(() => this.progress.isComplete(this.lesson().id));
  readonly number = computed(() => String(this.index() + 1).padStart(2, '0'));

  toggle(): void {
    this.progress.toggle(this.lesson().id);
  }

  text(block: Block): string {
    return block.type === 'p' || block.type === 'h3' ? block.text : '';
  }

  code(block: Block): CodeBlockData {
    return block as CodeBlockData;
  }

  compare(block: Block): CompareBlockData {
    return block as CompareBlockData;
  }

  callout(block: Block): CalloutBlockData {
    return block as CalloutBlockData;
  }

  list(block: Block): ListBlockData {
    return block as ListBlockData;
  }

  table(block: Block): TableBlockData {
    return block as TableBlockData;
  }

  quiz(block: Block): QuizBlock {
    return block as QuizBlock;
  }

  qa(block: Block): QaBlockData {
    return block as QaBlockData;
  }

  steps(block: Block): StepsBlockData {
    return block as StepsBlockData;
  }

  toneLabel(tone: CalloutTone): string {
    switch (tone) {
      case 'interview':
        return 'Interview note';
      case 'warn':
        return 'Gotcha';
      case 'why':
        return 'Why it matters';
      default:
        return 'Tip';
    }
  }
}
