import { ALL_LESSONS } from './content';
import { CHEAT_SECTIONS } from './content/cheatsheet.content';
import { Block } from './content.models';

export interface SearchEntry {
  id: string;
  title: string;
  context: string;
  url: string;
  keywords: string;
}

function blockText(block: Block): string {
  switch (block.type) {
    case 'p':
    case 'h3':
      return block.text;
    case 'code':
      return block.title ?? '';
    case 'compare':
      return block.caption ?? '';
    case 'callout':
      return block.title + ' ' + block.text;
    case 'list':
      return block.items.join(' ');
    case 'table':
      return [...block.headers, ...block.rows.flat()].join(' ');
    case 'quiz':
      return block.question + ' ' + block.options.join(' ');
    case 'qa':
      return block.items.map((item) => item.q + ' ' + item.a).join(' ');
    case 'steps':
      return block.items.map((item) => item.title + ' ' + item.text).join(' ');
    default:
      return '';
  }
}

export const SEARCH_ENTRIES: SearchEntry[] = [
  ...ALL_LESSONS.map(({ day, lesson }) => ({
    id: lesson.id,
    title: lesson.title,
    context: day.label + ' · ' + day.title,
    url: '/day/' + day.id + '#' + lesson.id,
    keywords: [
      lesson.summary,
      ...lesson.takeaways,
      ...lesson.blocks.map(blockText),
    ].join(' '),
  })),
  ...CHEAT_SECTIONS.map((section) => ({
    id: 'cheat-' + section.id,
    title: section.title,
    context: 'Cheat sheet',
    url: '/cheatsheet#' + section.id,
    keywords: [
      section.description,
      ...section.rows.map(
        (row) => row.topic + ' ' + row.react + ' ' + row.angular + ' ' + (row.note ?? ''),
      ),
    ].join(' '),
  })),
  {
    id: 'drills',
    title: 'Interview drills',
    context: 'Practice',
    url: '/drills',
    keywords:
      'flashcards quiz rapid fire karat practice mock interview timed questions',
  },
  {
    id: 'plan',
    title: 'Three-day plan',
    context: 'Start here',
    url: '/',
    keywords:
      'three day plan schedule dashboard progress day one two three study curriculum',
  },
];
