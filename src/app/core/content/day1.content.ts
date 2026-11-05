import { StudyDay } from '../content.models';

export const DAY_ONE: StudyDay = {
  id: '1',
  label: 'Day 01',
  title: 'The mental model',
  subtitle: 'Components, templates, bindings, control flow, and signals.',
  duration: '4–5 hours',
  goal: 'By tonight you can read an Angular component and write one from scratch without looking anything up.',
  lessons: [
    {
      id: 'mental-model',
      title: 'The 60-second mental model',
      minutes: 20,
      summary:
        'Translate what you already know about React into Angular vocabulary, and learn the three ideas that make Angular feel different.',
      blocks: [
        {
          type: 'p',
          text: 'You are not learning a new way to think about UI. You are learning a new way to **express the same ideas**. Components, props, state, effects, context, and routing all exist in Angular — they just have different names and stronger opinions.',
        },
        {
          type: 'p',
          text: 'Angular is a **framework**, not a view library. Routing, HTTP, forms, dependency injection, and testing are first-party. That is why a new Angular app has more structure on day one, and why interviewers expect you to know where things live.',
        },
        {
          type: 'table',
          headers: ['Idea', 'React', 'Angular'],
          rows: [
            ['View', 'JSX returned from a function', 'HTML template + Angular syntax'],
            ['State', 'useState / useReducer', 'Signals (modern) or class fields'],
            ['Derived state', 'useMemo', 'computed()'],
            ['Side effects', 'useEffect', 'effect(), lifecycle hooks, RxJS'],
            ['Props down', 'props', 'input() / @Input()'],
            ['Events up', 'callback props', 'output() / @Output()'],
            ['Shared state', 'Context, Zustand, Redux', 'Services + dependency injection'],
            ['Async data', 'fetch + useEffect, TanStack Query', 'HttpClient + RxJS or resources'],
            ['Rendering', 'Re-render function, diff virtual DOM', 'Change detection over bindings, no virtual DOM'],
            ['Compilation', 'JSX transformed to JS', 'Templates compiled AOT by the Angular compiler'],
          ],
        },
        {
          type: 'callout',
          tone: 'interview',
          title: 'The answer that scores points',
          text: '"Angular is an opinionated, batteries-included framework. React is a library for rendering UI. Angular gives you DI, RxJS, routing, forms, and HTTP out of the box, and compiles templates ahead of time instead of diffing a virtual DOM." Then stop. You have answered the question.',
        },
        {
          type: 'h3',
          text: 'The same counter, both ways',
        },
        {
          type: 'compare',
          react: `import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}`,
          angular: `import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-counter',
  templateUrl: './counter.html',
})
export class Counter {
  count = signal(0);

  increment() {
    this.count.update(n => n + 1);
  }
}`,
          lang: 'ts',
          caption:
            'Angular splits the class (logic) from the template (view). That separation is the first thing to get comfortable with.',
        },
        {
          type: 'code',
          lang: 'html',
          title: 'counter.html',
          code: `<button (click)="increment()">
  Count: {{ count() }}
</button>`,
        },
        {
          type: 'h3',
          text: 'Three differences that actually matter',
        },
        {
          type: 'steps',
          items: [
            {
              title: 'Templates are HTML, not JavaScript',
              text: 'You cannot write arbitrary JS in a template. No assignments, no new, no arrow functions. You bind to properties and call class methods. The Angular compiler can then analyse and optimise every binding.',
            },
            {
              title: 'Dependency injection is built in',
              text: 'Instead of importing a singleton or threading props, you ask for a dependency and Angular resolves it from an injector tree. This is how services, router, HTTP, and configuration are shared.',
            },
            {
              title: 'Reactivity is explicit',
              text: 'Signals tell Angular exactly which bindings changed. You do not re-run a component function. Angular marks the views that read that signal and refreshes only those bindings. This is why signals and OnPush are the modern default.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'why',
          title: 'Why this matters for the interview',
          text: 'Karat interviewers often probe whether you understand the framework or just memorised syntax. Being able to say "Angular tracks bindings and signals, React re-renders and diffs" is a strong signal that you understand both.',
        },
        {
          type: 'quiz',
          question:
            'Which statement best describes the difference between React and Angular rendering?',
          options: [
            'React compiles templates ahead of time; Angular interprets JSX at runtime.',
            'Angular uses a virtual DOM; React updates the real DOM directly.',
            'React re-renders component functions and diffs a virtual tree; Angular runs change detection over bindings without a virtual DOM.',
            'They both use the same rendering engine, so there is no meaningful difference.',
          ],
          answer: 2,
          explain:
            'React re-executes component functions and reconciles a virtual tree. Angular compiles templates and runs change detection over binding expressions, updating the real DOM directly. Both are fast; the mechanisms differ.',
        },
      ],
      takeaways: [
        'Angular is a framework; React is a view library.',
        'Templates are HTML with Angular syntax, compiled AOT.',
        'Signals + change detection replace hooks + re-render.',
        'Dependency injection is the Angular equivalent of context, but more powerful.',
      ],
    },
    {
      id: 'anatomy',
      title: 'Project anatomy and the CLI',
      minutes: 25,
      summary:
        'Where the entry point, root component, config, and routes live — and the five CLI commands you will actually use.',
      blocks: [
        {
          type: 'p',
          text: 'A modern Angular project is small once you know the five files that matter. Open a project and trace the boot path: `main.ts` → `App` → `app.config.ts` → router.',
        },
        {
          type: 'code',
          lang: 'bash',
          title: 'Create and run',
          code: `npm install -g @angular/cli
ng new my-app --style=css --routing
cd my-app
ng serve --open

# The commands you will use in a live interview
ng generate component product-card
ng generate service cart
ng generate pipe initials
ng build
ng test`,
        },
        {
          type: 'code',
          lang: 'ts',
          title: 'src/main.ts',
          code: `import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch(err => console.error(err));`,
        },
        {
          type: 'code',
          lang: 'ts',
          title: 'src/app/app.config.ts',
          code: `import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
  ],
};`,
        },
        {
          type: 'p',
          text: 'Since Angular 19, components are **standalone by default** — no `NgModule` is required. A component imports exactly what its template uses. NgModules still exist in older codebases, so recognise them, but do not start new work with them.',
        },
        {
          type: 'table',
          headers: ['Path', 'What it does'],
          rows: [
            ['src/main.ts', 'Bootstraps the root component with the app config'],
            ['src/app/app.ts', 'Root component; usually holds the shell and <router-outlet>'],
            ['src/app/app.config.ts', 'Global providers: router, HTTP, interceptors'],
            ['src/app/app.routes.ts', 'Route table'],
            ['angular.json', 'Build, serve, and asset configuration'],
            ['src/styles.css', 'Global styles'],
            ['public/', 'Static assets copied as-is'],
          ],
        },
        {
          type: 'callout',
          tone: 'warn',
          title: 'File naming changed',
          text: 'Angular 20+ generates app.ts / app.html / app.css instead of app.component.ts. Both conventions are common in the wild. Do not "fix" a codebase to match the other; follow the project.',
        },
        {
          type: 'callout',
          tone: 'warn',
          title: 'Older codebases will look different',
          text: 'If the interview project is on Angular 15–18, expect NgModules, *ngIf / *ngFor, constructor injection, @Input / @Output, and Zone.js. Read those as the legacy form of what you learn here. Do not rewrite them mid-interview unless the task asks for it.',
        },
        {
          type: 'callout',
          tone: 'interview',
          title: 'If they ask you to scaffold live',
          text: 'Say the boot path out loud: main.ts bootstraps App with appConfig, appConfig registers the router and HttpClient, routes lazy-load feature components, and each component declares its own imports. That is a complete answer.',
        },
        {
          type: 'quiz',
          question:
            'In a standalone Angular app, where do you register application-wide providers such as the router and HttpClient?',
          options: [
            'In main.ts, inside bootstrapApplication only',
            'In the root component decorator',
            'In app.config.ts, passed to bootstrapApplication',
            'In every component that needs them',
          ],
          answer: 2,
          explain:
            'app.config.ts exports an ApplicationConfig whose providers array is passed to bootstrapApplication. Feature-scoped providers can also be declared on routes or components.',
        },
      ],
      takeaways: [
        'Boot path: main.ts → bootstrapApplication(App, appConfig) → router.',
        'Standalone components import what they use; NgModules are legacy.',
        'CLI: ng serve, ng generate, ng build, ng test.',
        'Angular 20+ uses app.ts naming; older projects use app.component.ts.',
      ],
    },
    {
      id: 'components',
      title: 'Components, templates, and styles',
      minutes: 35,
      summary:
        'The @Component decorator, selectors, standalone imports, view encapsulation, and how a component maps to a React function.',
      blocks: [
        {
          type: 'p',
          text: 'A component is a TypeScript class plus a template. The decorator tells Angular how to create it, what it is called in HTML, and which other components, directives, and pipes its template may use.',
        },
        {
          type: 'code',
          lang: 'ts',
          title: 'product-card.ts',
          code: `import { Component, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

export interface Product {
  id: number;
  name: string;
  price: number;
  inStock: boolean;
}

@Component({
  selector: 'app-product-card',
  imports: [CurrencyPipe],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  product = input.required<Product>();
}`,
        },
        {
          type: 'code',
          lang: 'html',
          title: 'product-card.html',
          code: `<article class="card" [class.sold-out]="!product().inStock">
  <h3>{{ product().name }}</h3>
  <p>{{ product().price | currency }}</p>

  @if (!product().inStock) {
    <span class="badge">Sold out</span>
  }
</article>`,
        },
        {
          type: 'compare',
          react: `export function ProductCard({ product }: { product: Product }) {
  return (
    <article className={product.inStock ? 'card' : 'card sold-out'}>
      <h3>{product.name}</h3>
      <p>{formatPrice(product.price)}</p>
      {!product.inStock && <span className="badge">Sold out</span>}
    </article>
  );
}`,
          angular: `@Component({
  selector: 'app-product-card',
  imports: [CurrencyPipe],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  product = input.required<Product>();
}`,
          lang: 'ts',
          caption:
            'The Angular class is mostly state and behaviour. The template owns presentation.',
        },
        {
          type: 'h3',
          text: 'The pieces of the decorator',
        },
        {
          type: 'list',
          items: [
            '`selector` — the custom element name used in a parent template, e.g. `<app-product-card />`.',
            '`imports` — standalone dependencies used by the template: components, directives, pipes.',
            '`template` or `templateUrl` — inline HTML or a separate file. Prefer templateUrl once it grows.',
            '`styles` or `styleUrl` — component-scoped CSS. Angular emulates encapsulation with generated attributes.',
            '`providers` — optional component-level DI providers, creating a new instance for this subtree.',
          ],
        },
        {
          type: 'p',
          text: 'Styles are scoped by default. A `.card` rule in `product-card.css` will not leak into other components. Global styles still apply. This is roughly CSS Modules, but built in.',
        },
        {
          type: 'callout',
          tone: 'warn',
          title: 'Do not use `new` for components or services',
          text: 'Angular must create components so it can wire inputs, DI, and change detection. Use the template, `viewChild`, or `ViewContainerRef.createComponent`. For services, use `inject()`.',
        },
        {
          type: 'callout',
          tone: 'tip',
          title: 'React mental mapping',
          text: 'A React function component is closest to an Angular component class + template. `props` become inputs. Children become content projection. Local `useState` becomes a signal field. Event callbacks become outputs.',
        },
        {
          type: 'quiz',
          question:
            'You created a standalone component that uses `@if` and `CurrencyPipe` in its template. What must the component do?',
          options: [
            'Import CommonModule in app.config.ts',
            'Add CurrencyPipe to the component imports array; @if is built into the template syntax',
            'Declare the component in an NgModule',
            'Nothing — all directives and pipes are globally available',
          ],
          answer: 1,
          explain:
            '@if, @for, and @switch are built-in control flow and need no import. Pipes and other directives must be added to the standalone component imports array.',
        },
      ],
      takeaways: [
        'A component = class + template + scoped styles.',
        'Standalone components declare their own imports.',
        'Selectors are custom elements; inputs are the props.',
        'Never instantiate components or services with new.',
      ],
    },
    {
      id: 'bindings',
      title: 'Bindings and events',
      minutes: 35,
      summary:
        'Interpolation, property vs attribute binding, class/style bindings, events, and two-way binding — with the React equivalents.',
      blocks: [
        {
          type: 'p',
          text: 'Angular templates have four binding directions. Learn the punctuation and you can read almost any template.',
        },
        {
          type: 'table',
          headers: ['Syntax', 'Direction', 'Example'],
          rows: [
            ['{{ expression }}', 'Component → view (text)', '{{ user().name }}'],
            ['[property]="expr"', 'Component → view (property)', '[disabled]="saving()"'],
            ['(event)="handler($event)"', 'View → component', '(click)="save()"'],
            ['[(ngModel)]="value"', 'Both directions', '[(ngModel)]="email"'],
          ],
        },
        {
          type: 'code',
          lang: 'html',
          title: 'A realistic form-free template',
          code: `<img [src]="product().imageUrl" [alt]="product().name" />

<button
  type="button"
  [disabled]="saving()"
  [class.is-saving]="saving()"
  [attr.aria-busy]="saving()"
  (click)="addToCart(product())"
>
  {{ saving() ? 'Adding…' : 'Add to cart' }}
</button>

<input
  [value]="query()"
  (input)="query.set($any($event.target).value)"
  placeholder="Search"
/>`,
        },
        {
          type: 'h3',
          text: 'Property vs attribute',
        },
        {
          type: 'p',
          text: 'Use `[property]` for DOM properties and `[attr.name]` for HTML attributes that have no matching property. `[class.foo]` and `[style.width.px]` are specialised bindings. When in doubt: `disabled`, `value`, `checked`, `src` are properties; `aria-*`, `data-*`, `colspan` are usually attributes.',
        },
        {
          type: 'code',
          lang: 'html',
          code: `<!-- Toggle one class -->
<div [class.active]="isActive()">…</div>

<!-- Multiple classes at once -->
<div [ngClass]="{ active: isActive(), error: hasError() }">…</div>

<!-- Inline styles -->
<div [style.width.px]="width()" [style.color]="color()">…</div>

<!-- Multiple styles at once -->
<div [ngStyle]="{ width: width() + 'px', color }">…</div>`,
        },
        {
          type: 'p',
          text: '`ngClass` and `ngStyle` come from `CommonModule` / `NgClass` / `NgStyle`, so add them to the component imports if you use them. Prefer the dedicated `[class.x]` and `[style.x]` bindings when you only toggle one value.',
        },
        {
          type: 'compare',
          react: `<button
  onClick={() => addToCart(product)}
  disabled={saving}
  className={saving ? 'btn is-saving' : 'btn'}
  aria-busy={saving}
>
  {saving ? 'Adding…' : 'Add to cart'}
</button>`,
          angular: `<button
  (click)="addToCart(product())"
  [disabled]="saving()"
  [class.is-saving]="saving()"
  [attr.aria-busy]="saving()"
>
  {{ saving() ? 'Adding…' : 'Add to cart' }}
</button>`,
          lang: 'html',
        },
        {
          type: 'h3',
          text: 'Events and $event',
        },
        {
          type: 'p',
          text: 'Angular passes the native event as `$event`. For typed access, cast it or use a template reference. Avoid putting complex logic in the template; call a method with a clear name.',
        },
        {
          type: 'code',
          lang: 'html',
          code: `<input #searchBox (keyup.enter)="search(searchBox.value)" />

<select (change)="setSort($any($event.target).value)">
  <option value="name">Name</option>
  <option value="price">Price</option>
</select>`,
        },
        {
          type: 'callout',
          tone: 'warn',
          title: 'Template expression rules',
          text: 'Templates support property access, method calls, pipes, ternary, and safe navigation (`?.`). They do not support assignments, `new`, `++`, or arrow functions. Move that logic into the class.',
        },
        {
          type: 'callout',
          tone: 'interview',
          title: 'Common gotcha question',
          text: '"Why does `[value]` not update when the user types?" Because a property binding is one-way: it writes from the component to the DOM, but does not listen for changes. Use `(input)` or two-way binding with `[(ngModel)]` / a `model()` signal.',
        },
        {
          type: 'quiz',
          question:
            'Which binding correctly sets an accessible label on a `<div>`?',
          options: [
            '[aria-label]="label()"',
            '[attr.aria-label]="label()"',
            '(aria-label)="label()"',
            '{{ aria-label }}="label()"',
          ],
          answer: 1,
          explain:
            '`aria-label` is an HTML attribute with no DOM property, so use `[attr.aria-label]`. Angular will throw a template error for `[aria-label]` unless a matching property exists.',
        },
      ],
      takeaways: [
        'Four bindings: {{ }}, [property], (event), [(two-way)].',
        'Use [attr.x] for attributes, [class.x] / [style.x] for classes and styles.',
        '$event is the native event; templates cannot contain arbitrary statements.',
        'Property binding is one-way; two-way binding needs a listener or model().',
      ],
    },
    {
      id: 'control-flow',
      title: 'Control flow that reads like code',
      minutes: 30,
      summary:
        'The built-in @if, @for, @switch, and @let blocks — plus the legacy *ngIf / *ngFor syntax you will see in older code.',
      blocks: [
        {
          type: 'p',
          text: 'Since Angular 17, control flow is part of the template language. No imports, no structural directive ceremony. It compiles to efficient code and is the syntax to use in new work.',
        },
        {
          type: 'code',
          lang: 'html',
          title: 'Modern control flow',
          code: `@if (user(); as user) {
  <h2>Welcome back, {{ user.name }}</h2>
} @else if (loading()) {
  <app-spinner />
} @else {
  <a routerLink="/login">Sign in</a>
}

@for (product of products(); track product.id) {
  <app-product-card [product]="product" />
} @empty {
  <p>No products match that search.</p>
}

@switch (status()) {
  @case ('loading') { <app-spinner /> }
  @case ('error')   { <p>Something went wrong.</p> }
  @default          { <app-product-list [products]="products()" /> }
}

@let itemCount = cart().length;
@let label = itemCount === 1 ? 'item' : 'items';
<p>{{ itemCount }} {{ label }}</p>`,
        },
        {
          type: 'compare',
          react: `{loading ? (
  <Spinner />
) : user ? (
  <h2>Welcome back, {user.name}</h2>
) : (
  <a href="/login">Sign in</a>
)}

{products.length === 0 ? (
  <p>No products match that search.</p>
) : (
  products.map(product => (
    <ProductCard key={product.id} product={product} />
  ))
)}`,
          angular: `@if (loading()) {
  <app-spinner />
} @else if (user(); as user) {
  <h2>Welcome back, {{ user.name }}</h2>
} @else {
  <a routerLink="/login">Sign in</a>
}

@for (product of products(); track product.id) {
  <app-product-card [product]="product" />
} @empty {
  <p>No products match that search.</p>
}`,
          lang: 'html',
        },
        {
          type: 'h3',
          text: 'track is not optional',
        },
        {
          type: 'p',
          text: '`@for` requires a `track` expression. It tells Angular how to identify each item across renders. Track a stable unique value — usually `item.id`, not the loop index. Tracking by index causes DOM reuse bugs when items are inserted or reordered.',
        },
        {
          type: 'callout',
          tone: 'warn',
          title: 'Legacy syntax you must still recognise',
          text: 'Older code uses *ngIf, *ngFor, and *ngSwitch. They require CommonModule (or NgIf/NgFor) in imports. *ngFor uses trackBy with a function, not the track keyword. You should be able to read it even if you write @if/@for.',
        },
        {
          type: 'code',
          lang: 'html',
          title: 'Legacy equivalents',
          code: `<ng-container *ngIf="user; else login">
  <h2>Welcome back, {{ user.name }}</h2>
</ng-container>
<ng-template #login><a routerLink="/login">Sign in</a></ng-template>

<li *ngFor="let product of products; trackBy: trackById">
  {{ product.name }}
</li>

<div [ngSwitch]="status">
  <app-spinner *ngSwitchCase="'loading'" />
  <p *ngSwitchDefault>Done</p>
</div>`,
        },
        {
          type: 'code',
          lang: 'ts',
          title: 'trackBy in the class',
          code: `trackById(_index: number, product: Product): number {
  return product.id;
}`,
        },
        {
          type: 'callout',
          tone: 'tip',
          title: 'ng-container',
          text: 'Use `<ng-container>` when you need a structural directive or control-flow block without adding an extra DOM element. It renders nothing.',
        },
        {
          type: 'quiz',
          question: 'Why does `@for` require `track`?',
          options: [
            'It is only needed for TypeScript type inference.',
            'It gives Angular a stable identity for each item so it can reuse DOM nodes and preserve state correctly.',
            'It replaces the need for a key in React.',
            'It is optional in production builds.',
          ],
          answer: 1,
          explain:
            'track gives Angular item identity across updates. Without a stable key, Angular cannot know which DOM nodes correspond to which data, causing unnecessary recreation or stale state.',
        },
        {
          type: 'quiz',
          question:
            'Which block lets you declare a local template variable without rendering an element?',
          options: ['@if', '@let', '@switch', '@defer'],
          answer: 1,
          explain:
            '@let declares a read-only template-local variable, e.g. @let total = cart().reduce(...). It is useful for expensive-ish derived values used multiple times in a template.',
        },
      ],
      takeaways: [
        '@if / @else if / @else, @for / @empty, @switch, @let are built in.',
        '@for requires track; use a stable id, not the index.',
        'Legacy *ngIf / *ngFor still appear in older code and need imports.',
        'ng-container renders no DOM element.',
      ],
    },
    {
      id: 'signals',
      title: 'Signals: state without dependency arrays',
      minutes: 45,
      summary:
        'signal(), computed(), effect(), linkedSignal(), and the immutable-update rules that keep change detection honest.',
      blocks: [
        {
          type: 'p',
          text: 'A signal is a value wrapper that tells Angular when it changes. Read it by calling it. Write it with `set` or `update`. Angular tracks every signal read in a template and refreshes exactly those bindings when the value changes.',
        },
        {
          type: 'code',
          lang: 'ts',
          title: 'The core four',
          code: `import { computed, effect, signal } from '@angular/core';

export class CartStore {
  // Writable state
  readonly items = signal<CartItem[]>([]);
  readonly coupon = signal<string | null>(null);

  // Derived state: lazy + memoised
  readonly subtotal = computed(() =>
    this.items().reduce((sum, item) => sum + item.price * item.qty, 0)
  );

  readonly discount = computed(() =>
    this.coupon() === 'SAVE10' ? this.subtotal() * 0.1 : 0
  );

  readonly total = computed(() => this.subtotal() - this.discount());

  add(item: CartItem) {
    this.items.update(items => [...items, item]);
  }

  remove(id: number) {
    this.items.update(items => items.filter(item => item.id !== id));
  }

  constructor() {
    // Side effect for a non-reactive API. Not for deriving state.
    effect(() => {
      localStorage.setItem('cart', JSON.stringify(this.items()));
    });
  }
}`,
        },
        {
          type: 'compare',
          react: `const [items, setItems] = useState<CartItem[]>([]);
const [coupon, setCoupon] = useState<string | null>(null);

const subtotal = useMemo(
  () => items.reduce((sum, i) => sum + i.price * i.qty, 0),
  [items]
);

useEffect(() => {
  localStorage.setItem('cart', JSON.stringify(items));
}, [items]);`,
          angular: `readonly items = signal<CartItem[]>([]);
readonly coupon = signal<string | null>(null);

readonly subtotal = computed(() =>
  this.items().reduce((sum, i) => sum + i.price * i.qty, 0)
);

constructor() {
  effect(() => {
    localStorage.setItem('cart', JSON.stringify(this.items()));
  });
}`,
          lang: 'ts',
          caption:
            'No dependency arrays. Signals track their own dependencies; computed values are memoised and recompute only when a dependency changes.',
        },
        {
          type: 'h3',
          text: 'The rules',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'Read with `count()`, never `count` — the call is what registers the dependency.',
            'Update with `set(next)` or `update(prev => next)`. Do not mutate the value in place; replace arrays and objects.',
            'Use `computed` for derived state. Do not derive state in `effect`.',
            'Use `effect` only to synchronise with something outside Angular: localStorage, a chart library, analytics, a non-signal API.',
            'Call `signal`/`computed`/`effect` in an injection context — field initialisers or a constructor — so Angular can tie lifetimes correctly.',
          ],
        },
        {
          type: 'code',
          lang: 'ts',
          title: 'Immutable updates',
          code: `// Arrays
this.items.update(items => [...items, newItem]);
this.items.update(items => items.filter(i => i.id !== id));
this.items.update(items =>
  items.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i)
);

// Objects
this.user.update(user => ({ ...user, name: 'Ada' }));

// A new object with the same contents is still a change.
// Signals use Object.is by default, so replace, do not mutate.`,
        },
        {
          type: 'h3',
          text: 'linkedSignal: derived state you can also write',
        },
        {
          type: 'p',
          text: 'Sometimes state should reset when a source changes, but still be editable by the user. `linkedSignal` is that tool — think "selected item follows the list, until the user picks one".',
        },
        {
          type: 'code',
          lang: 'ts',
          code: `readonly products = signal<Product[]>([]);
readonly selectedId = linkedSignal(() => this.products()[0]?.id ?? null);

// User can still override it
this.selectedId.set(42);`,
        },
        {
          type: 'callout',
          tone: 'interview',
          title: 'Signals vs RxJS',
          text: 'Signals model synchronous state and derivations. RxJS models asynchronous event streams and cancellation. They interoperate with toSignal() and toObservable(). Do not try to replace one with the other; use signals for view state, RxJS for streams.',
        },
        {
          type: 'callout',
          tone: 'warn',
          title: 'Do not read a signal inside effect to "sync" state',
          text: 'If you find yourself writing effect(() => other.set(this.value())), use computed() instead. Effects are for external side effects and run after change detection. Computed values are declarative, lazy, and cannot loop.',
        },
        {
          type: 'quiz',
          question:
            'What is wrong with this code? `items = signal<string[]>([]); add(item: string) { this.items().push(item); }`',
          options: [
            'Nothing — signals track array mutations.',
            'push returns a number, which breaks the signal.',
            'It mutates the array in place, so the signal value is the same reference and no update is detected.',
            'You must call items.set() before reading.',
          ],
          answer: 2,
          explain:
            'Signals use referential equality by default. Mutating the array keeps the same reference, so Angular sees no change. Use items.update(list => [...list, item]).',
        },
        {
          type: 'quiz',
          question: 'Which is the best use of effect()?',
          options: [
            'Computing a full name from first and last name signals',
            'Filtering a list whenever a search signal changes',
            'Syncing a signal value to document.title',
            'Fetching data on every keystroke',
          ],
          answer: 2,
          explain:
            'Derived values belong in computed(). Filtering is a computed. Fetching belongs in a resource or an RxJS stream with switchMap. Writing to document.title is a genuine external side effect, which is what effect() is for.',
        },
      ],
      takeaways: [
        'signal() is writable state; computed() is lazy, memoised derived state.',
        'Read signals with (); update immutably with set/update.',
        'effect() is for external side effects, not state derivation.',
        'linkedSignal() handles derived-but-editable state.',
      ],
    },
    {
      id: 'inputs-outputs',
      title: 'Inputs, outputs, and two-way binding',
      minutes: 35,
      summary:
        'Signal inputs, output(), model(), transforms, and the legacy decorators you will still encounter.',
      blocks: [
        {
          type: 'p',
          text: 'Angular components communicate the same way React components do: data down, events up. Modern Angular expresses both as signals.',
        },
        {
          type: 'code',
          lang: 'ts',
          title: 'quantity-stepper.ts',
          code: `import { Component, input, output, model, numberAttribute } from '@angular/core';

@Component({
  selector: 'app-quantity-stepper',
  templateUrl: './quantity-stepper.html',
})
export class QuantityStepper {
  // Required input: parent must provide it
  readonly max = input.required<number>();

  // Optional input with a default and a transform
  readonly step = input(1, { transform: numberAttribute });

  // Two-way bindable: [(quantity)]="value"
  readonly quantity = model(1);

  // Event out
  readonly atMax = output<number>();

  increment() {
    const next = Math.min(this.quantity() + this.step(), this.max());
    this.quantity.set(next);
    if (next === this.max()) this.atMax.emit(next);
  }

  decrement() {
    this.quantity.update(q => Math.max(0, q - this.step()));
  }
}`,
        },
        {
          type: 'code',
          lang: 'html',
          title: 'quantity-stepper.html',
          code: `<div class="stepper">
  <button (click)="decrement()" [disabled]="quantity() === 0">−</button>
  <span>{{ quantity() }}</span>
  <button (click)="increment()" [disabled]="quantity() === max()">+</button>
</div>`,
        },
        {
          type: 'code',
          lang: 'html',
          title: 'Parent usage',
          code: `<app-quantity-stepper
  [max]="stock()"
  [step]="2"
  [(quantity)]="selectedQuantity"
  (atMax)="warnLowStock($event)"
/>`,
        },
        {
          type: 'compare',
          react: `function QuantityStepper({ max, step = 1, quantity, onChange, onAtMax }) {
  const increment = () => {
    const next = Math.min(quantity + step, max);
    onChange(next);
    if (next === max) onAtMax(next);
  };
  // ...
}`,
          angular: `readonly max = input.required<number>();
readonly step = input(1, { transform: numberAttribute });
readonly quantity = model(1);
readonly atMax = output<number>();

increment() {
  const next = Math.min(this.quantity() + this.step(), this.max());
  this.quantity.set(next);
  if (next === this.max()) this.atMax.emit(next);
}`,
          lang: 'ts',
          caption:
            'model() combines an input and an output. It is the Angular equivalent of a controlled prop plus onChange.',
        },
        {
          type: 'h3',
          text: 'Legacy decorators',
        },
        {
          type: 'code',
          lang: 'ts',
          code: `import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({ selector: 'app-card', templateUrl: './card.html' })
export class Card {
  @Input({ required: true }) product!: Product;
  @Input() compact = false;

  @Output() selected = new EventEmitter<Product>();

  select() {
    this.selected.emit(this.product);
  }
}`,
        },
        {
          type: 'p',
          text: 'Decorator inputs are still supported and common in older code. Signal inputs are preferred in new code because they participate in reactivity: reading `product()` in a template marks that view dirty when the input changes. If you must mutate or transform an incoming value, use a `computed` rather than `ngOnChanges` where possible.',
        },
        {
          type: 'callout',
          tone: 'warn',
          title: 'Input signals are read-only',
          text: 'You cannot call `this.product.set(...)` on an input(). If a child needs to edit a value, either emit an output or use model(). Two-way binding is explicit, not implied.',
        },
        {
          type: 'callout',
          tone: 'interview',
          title: 'How do components communicate?',
          text: 'Parent → child: input() / @Input. Child → parent: output() / @Output with EventEmitter. Both directions: model() or a shared service. Unrelated components: a service with signals or a Subject. Content projection handles "children" / slots.',
        },
        {
          type: 'quiz',
          question:
            'A child component needs to let the parent edit a value in both directions. Which API fits best?',
          options: ['input()', 'output()', 'model()', 'viewChild()'],
          answer: 2,
          explain:
            'model() creates a writable signal input that emits changes, enabling [(value)] two-way binding. input() is one-way; output() only sends events up.',
        },
      ],
      takeaways: [
        'input() / input.required() replace @Input for new code.',
        'output() replaces @Output + EventEmitter.',
        'model() enables [(value)] two-way binding.',
        'Data down, events up; services for unrelated components.',
      ],
    },
    {
      id: 'pipes',
      title: 'Pipes and the template toolkit',
      minutes: 35,
      summary:
        'Format values without helper functions: built-in pipes, custom pipes, pure vs impure, and the template helpers worth knowing.',
      blocks: [
        {
          type: 'p',
          text: 'A pipe transforms a value in the template. It is the Angular answer to calling a formatter inline — except pipes are cached and reusable.',
        },
        {
          type: 'code',
          lang: 'html',
          code: `<p>{{ price | currency:'USD':'symbol':'1.2-2' }}</p>
<p>{{ createdAt | date:'mediumDate' }}</p>
<p>{{ user()?.name | uppercase }}</p>
<p>{{ config | json }}</p>
<p>{{ users$ | async }}</p>
<p>{{ longText | slice:0:120 }}…</p>`,
        },
        {
          type: 'code',
          lang: 'ts',
          title: 'A custom pure pipe',
          code: `import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'initials' })
export class InitialsPipe implements PipeTransform {
  transform(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .map(part => part[0])
      .join('')
      .toUpperCase();
  }
}`,
        },
        {
          type: 'code',
          lang: 'html',
          title: 'Using it',
          code: `<span class="avatar">{{ user().name | initials }}</span>`,
        },
        {
          type: 'p',
          text: 'Add the pipe to the standalone component `imports` array. Pipes are pure by default: Angular re-runs them only when the input reference changes. An impure pipe runs on every change detection cycle — powerful, usually a performance mistake.',
        },
        {
          type: 'code',
          lang: 'ts',
          title: 'Impure pipe (use sparingly)',
          code: `@Pipe({ name: 'liveFilter', pure: false })
export class LiveFilterPipe implements PipeTransform {
  transform(items: Item[], query: string): Item[] {
    return items.filter(item => item.name.includes(query));
  }
}`,
        },
        {
          type: 'callout',
          tone: 'warn',
          title: 'Do not use a pipe for filtering if the array mutates',
          text: 'A pure pipe will not see in-place mutations. Either replace the array (recommended), make the filter a computed signal in the class, or accept the cost of an impure pipe. computed() is almost always the better answer.',
        },
        {
          type: 'h3',
          text: 'Template helpers worth knowing',
        },
        {
          type: 'list',
          items: [
            '`<ng-container>` — grouping without a DOM element.',
            '`<ng-template>` — a lazy template definition, used by structural directives and `ngTemplateOutlet`.',
            '`<ng-content>` — content projection; the Angular version of `children` / slots.',
            '`@defer` — lazy-load a template block and its dependencies when a trigger fires.',
            '`NgOptimizedImage` — responsive image loading with `ngSrc`.',
          ],
        },
        {
          type: 'code',
          lang: 'html',
          title: 'Content projection preview',
          code: `<!-- card.html -->
<div class="card">
  <header><ng-content select="[card-title]" /></header>
  <div class="body"><ng-content /></div>
</div>

<!-- parent -->
<app-card>
  <h3 card-title>Order summary</h3>
  <p>3 items · $42.00</p>
</app-card>`,
        },
        {
          type: 'callout',
          tone: 'tip',
          title: 'AsyncPipe is a subscription manager',
          text: '`users$ | async` subscribes when the view is created and unsubscribes when it is destroyed. It also marks the view for check when a value arrives. In signal-first code, `toSignal(users$)` is often cleaner, but AsyncPipe is still everywhere in Angular codebases.',
        },
        {
          type: 'h3',
          text: 'Custom attribute directives',
        },
        {
          type: 'p',
          text: 'A directive is behaviour without a template. Attribute directives change an existing element; structural directives change the DOM structure. Writing one is a common live-coding ask.',
        },
        {
          type: 'code',
          lang: 'ts',
          title: 'highlight.directive.ts',
          code: `import { Directive, input, signal } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  host: {
    '[style.background]': 'color()',
    '[class.is-hovered]': 'hovered()',
    '(mouseenter)': 'hovered.set(true)',
    '(mouseleave)': 'hovered.set(false)',
  },
})
export class Highlight {
  // <p appHighlight="rgba(255,184,107,.18)">
  readonly color = input('rgba(255, 59, 92, 0.14)', {
    alias: 'appHighlight',
  });

  readonly hovered = signal(false);
}`,
        },
        {
          type: 'code',
          lang: 'html',
          title: 'Usage',
          code: `<p appHighlight="rgba(255, 184, 107, 0.18)">
  This paragraph highlights on its own.
</p>`,
        },
        {
          type: 'callout',
          tone: 'warn',
          title: 'Add it to imports',
          text: 'A standalone component that uses the directive must include it in its `imports` array. The same is true for pipes and child components.',
        },
        {
          type: 'quiz',
          question:
            'Why might a pure pipe fail to update when you push a new item into an array?',
          options: [
            'Pipes cannot accept arrays.',
            'The array reference did not change, so the pure pipe was not re-evaluated.',
            'You must call pipe.refresh() manually.',
            'Pure pipes only run once per component.',
          ],
          answer: 1,
          explain:
            'Pure pipes run when their input reference changes. Mutating an array in place keeps the same reference. Replace the array or use a computed signal.',
        },
      ],
      takeaways: [
        'Pipes format values declaratively and are cached when pure.',
        'Custom pipes need @Pipe and a place in imports.',
        'Prefer computed() over impure pipes for filtering/sorting.',
        'ng-content projects children; AsyncPipe manages subscriptions.',
        'Attribute directives add behaviour; structural directives change layout.',
      ],
    },
  ],
};
