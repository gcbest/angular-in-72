export type CodeLang = 'ts' | 'tsx' | 'html' | 'bash' | 'css' | 'json' | 'js';

export type CalloutTone = 'tip' | 'warn' | 'interview' | 'why';

export interface QuizBlock {
  type: 'quiz';
  question: string;
  options: string[];
  answer: number;
  explain: string;
}

export type Block =
  | { type: 'p'; text: string }
  | { type: 'h3'; text: string }
  | {
      type: 'code';
      code: string;
      lang?: CodeLang;
      title?: string;
      caption?: string;
    }
  | {
      type: 'compare';
      react: string;
      angular: string;
      lang?: CodeLang;
      caption?: string;
      reactLabel?: string;
      angularLabel?: string;
    }
  | { type: 'callout'; tone: CalloutTone; title: string; text: string }
  | { type: 'list'; items: string[]; ordered?: boolean }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | QuizBlock
  | { type: 'qa'; items: { q: string; a: string }[] }
  | { type: 'steps'; items: { title: string; text: string }[] };

export interface Lesson {
  id: string;
  title: string;
  minutes: number;
  summary: string;
  blocks: Block[];
  takeaways: string[];
}

export interface StudyDay {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  duration: string;
  goal: string;
  lessons: Lesson[];
}

export interface CheatRow {
  topic: string;
  react: string;
  angular: string;
  note?: string;
}

export interface CheatSection {
  id: string;
  title: string;
  description: string;
  rows: CheatRow[];
}

export interface ApiItem {
  name: string;
  kind: 'decorator' | 'function' | 'class' | 'directive' | 'pipe' | 'operator';
  description: string;
}

export interface Flashcard {
  id: string;
  category: string;
  q: string;
  a: string;
}

export interface DrillQuestion {
  id: string;
  category: string;
  q: string;
  options: string[];
  answer: number;
  explain: string;
}
