import { Lesson, StudyDay } from '../content.models';
import { DAY_ONE } from './day1.content';
import { DAY_TWO } from './day2.content';
import { DAY_THREE } from './day3.content';

export { DAY_ONE, DAY_TWO, DAY_THREE };

export const DAYS: StudyDay[] = [DAY_ONE, DAY_TWO, DAY_THREE];

export const ALL_LESSONS: { day: StudyDay; lesson: Lesson }[] = DAYS.flatMap(
  (day) => day.lessons.map((lesson) => ({ day, lesson })),
);

export const TOTAL_LESSONS = ALL_LESSONS.length;

export const TOTAL_MINUTES = ALL_LESSONS.reduce(
  (sum, entry) => sum + entry.lesson.minutes,
  0,
);

export function findDay(id: string | null | undefined): StudyDay | undefined {
  return DAYS.find((day) => day.id === id);
}
