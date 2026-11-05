import { Component, computed, effect, inject, input } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { DAYS, findDay } from '../../core/content';
import { ProgressService } from '../../core/progress.service';
import { LessonView } from '../../shared/lesson-view/lesson-view';

@Component({
  selector: 'app-day',
  imports: [RouterLink, LessonView],
  templateUrl: './day.html',
  styleUrl: './day.css',
})
export class DayPage {
  readonly day = input<string>('1');

  private readonly progress = inject(ProgressService);
  private readonly title = inject(Title);

  constructor() {
    effect(() => {
      const day = this.studyDay();
      if (day) {
        this.title.setTitle(day.label + ': ' + day.title + ' — Angular in 72 Hours');
      }
    });
  }

  readonly studyDay = computed(() => findDay(this.day()));

  readonly stats = computed(() => {
    const day = this.studyDay();
    return day
      ? this.progress.dayStats(day)
      : { done: 0, total: 0, pct: 0 };
  });

  readonly previousDay = computed(() => {
    const day = this.studyDay();
    if (!day) return null;
    const index = DAYS.findIndex((item) => item.id === day.id);
    return index > 0 ? DAYS[index - 1] : null;
  });

  readonly nextDay = computed(() => {
    const day = this.studyDay();
    if (!day) return null;
    const index = DAYS.findIndex((item) => item.id === day.id);
    return DAYS[index + 1] ?? null;
  });

  isComplete(lessonId: string): boolean {
    return this.progress.isComplete(lessonId);
  }

  pad(index: number): string {
    return String(index).padStart(2, '0');
  }
}
