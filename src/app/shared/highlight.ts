import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import css from 'highlight.js/lib/languages/css';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import { CodeLang } from '../core/content.models';

hljs.registerLanguage('bash', bash);
hljs.registerLanguage('css', css);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('json', json);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('xml', xml);

const LANGUAGE_MAP: Record<CodeLang, string> = {
  ts: 'typescript',
  tsx: 'typescript',
  js: 'javascript',
  html: 'xml',
  bash: 'bash',
  css: 'css',
  json: 'json',
};

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function highlightCode(code: string, lang: CodeLang = 'ts'): string {
  try {
    return hljs.highlight(code, {
      language: LANGUAGE_MAP[lang] ?? 'typescript',
      ignoreIllegals: true,
    }).value;
  } catch {
    return escapeHtml(code);
  }
}

export function langLabel(lang: CodeLang): string {
  switch (lang) {
    case 'ts':
      return 'TypeScript';
    case 'tsx':
      return 'TSX';
    case 'js':
      return 'JavaScript';
    case 'html':
      return 'HTML';
    case 'bash':
      return 'Shell';
    case 'css':
      return 'CSS';
    case 'json':
      return 'JSON';
    default:
      return lang;
  }
}
