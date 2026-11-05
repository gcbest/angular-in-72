import { StudyDay } from '../content.models';

export const DAY_THREE: StudyDay = {
  id: '3',
  label: 'Day 03',
  title: 'Interview day',
  subtitle: 'Performance, testing, live-coding patterns, and the questions you will actually be asked.',
  duration: '4–5 hours',
  goal: 'By tonight you can build a feature under time pressure, explain your choices, and debug the common Angular traps.',
  lessons: [
    {
      id: 'performance',
      title: 'Performance and modern template features',
      minutes: 40,
      summary:
        'The handful of techniques that make an Angular app fast — and the answers to "how would you optimise this?"',
      blocks: [
        {
          type: 'p',
          text: 'Performance questions are really questions about change detection. If you understand what marks a view dirty, the techniques follow naturally.',
        },
        {
          type: 'steps',
          items: [
            {
              title: 'Use signals for view state',
              text: 'Signals give Angular precise dependency information. A signal update only refreshes the views that read it, instead of checking a component subtree.',
            },
            {
              title: 'Keep OnPush (now the default)',
              text: 'OnPush components are skipped unless an input changes, an event fires, a signal they read changes, an AsyncPipe emits, or markForCheck is called. Do not opt back into Eager/Default without a reason.',
            },
            {
              title: 'Track lists by identity',
              text: '@for requires track. Use a stable id so Angular can move existing DOM nodes instead of destroying and recreating them.',
            },
            {
              title: 'Defer heavy UI',
              text: '@defer downloads a block and its dependencies only when a trigger fires. Great for charts, editors, maps, and below-the-fold content.',
            },
            {
              title: 'Lazy-load routes',
              text: 'loadComponent / loadChildren split features into separate bundles. The initial bundle stays small.',
            },
            {
              title: 'Avoid work in template expressions',
              text: 'A method call in a binding runs on every check. Use a computed signal or a pure pipe. Avoid getters that allocate arrays.',
            },
          ],
        },
        {
          type: 'code',
          lang: 'html',
          title: '@defer',
          code: `@defer (on viewport) {
  <app-revenue-chart [data]="revenue()" />
} @placeholder {
  <div class="chart-skeleton"></div>
} @loading (minimum 200ms) {
  <app-spinner />
} @error {
  <p>Could not load the chart.</p>
}

<!-- Trigger when the user interacts, but prefetch while idle -->
@defer (on interaction; prefetch on idle) {
  <app-comments />
}`,
        },
        {
          type: 'code',
          lang: 'ts',
          title: 'Optimised images',
          code: `import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-hero',
  imports: [NgOptimizedImage],
  templateUrl: './hero.html',
})
export class Hero {}

// hero.html
// <img ngSrc="/hero.webp" width="1200" height="600" priority alt="Team offsite" />`,
        },
        {
          type: 'code',
          lang: 'ts',
          title: 'The template-call anti-pattern',
          code: `// BAD: allocates a new array on every change detection run
get visibleItems() {
  return this.items.filter(item => item.active);
}

// GOOD: computed, cached until items changes
readonly visibleItems = computed(() =>
  this.items().filter(item => item.active)
);`,
        },
        {
          type: 'callout',
          tone: 'interview',
          title: 'A complete performance answer',
          text: '"First I would measure. Then I would make sure state is signal-based and components stay OnPush, fix list tracking, move expensive derivations into computed values, lazy-load routes and defer heavy widgets, and check bundle size. If profiling still shows checks, I would look for template function calls and unnecessary subscriptions."',
        },
        {
          type: 'callout',
          tone: 'tip',
          title: 'Angular DevTools',
          text: 'The Angular DevTools browser extension profiles change detection and visualises the signal graph. Mentioning measurement before optimisation is a senior signal.',
        },
        {
          type: 'quiz',
          question:
            'A large list re-renders and loses input focus whenever an item is inserted. What is the most likely cause?',
          options: [
            'The list is not wrapped in ng-container',
            'The @for track expression uses the loop index instead of a stable id',
            'The component uses OnPush',
            'The list is a signal',
          ],
          answer: 1,
          explain:
            'Tracking by index makes Angular reuse the wrong DOM nodes when order changes, causing state/focus bugs and extra DOM work. Track a stable unique id.',
        },
      ],
      takeaways: [
        'Signals + OnPush + track are the performance baseline.',
        '@defer lazy-loads heavy UI; lazy routes split bundles.',
        'Never do expensive work in a template expression.',
        'Measure with DevTools before optimising.',
      ],
    },
    {
      id: 'testing',
      title: 'Testing without the ceremony',
      minutes: 40,
      summary:
        'TestBed, fixtures, HTTP testing, mocking services, and what a Karat interviewer expects you to know.',
      blocks: [
        {
          type: 'p',
          text: 'Angular tests use `TestBed` to create an isolated injector and render components. The syntax is usually Jasmine or Vitest; the Angular APIs are the same.',
        },
        {
          type: 'code',
          lang: 'ts',
          title: 'Component test',
          code: `import { TestBed } from '@angular/core/testing';
import { QuantityStepper } from './quantity-stepper';

describe('QuantityStepper', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuantityStepper],
    }).compileComponents();
  });

  it('increments and emits when it reaches the max', async () => {
    const fixture = TestBed.createComponent(QuantityStepper);
    fixture.componentRef.setInput('max', 2);
    await fixture.whenStable();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    buttons[1].click();
    await fixture.whenStable();

    expect(fixture.componentInstance.quantity()).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('2');
  });
});`,
        },
        {
          type: 'code',
          lang: 'ts',
          title: 'Service + HTTP test',
          code: `import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ProductApi } from './product-api';

describe('ProductApi', () => {
  let api: ProductApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(ProductApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads products', () => {
    let result: Product[] = [];
    api.list('desk').subscribe(products => (result = products));

    const req = http.expectOne(r => r.url === '/api/products');
    expect(req.request.params.get('q')).toBe('desk');
    req.flush([{ id: 1, name: 'Desk', price: 300 }]);

    expect(result.length).toBe(1);
  });
});`,
        },
        {
          type: 'code',
          lang: 'ts',
          title: 'Mocking a dependency',
          code: `const cartStub = {
  count: signal(3),
  total: signal(99),
  add: vi.fn(),
};

TestBed.configureTestingModule({
  imports: [CartButton],
  providers: [{ provide: CartService, useValue: cartStub }],
});`,
        },
        {
          type: 'list',
          items: [
            '`fixture.componentRef.setInput(...)` sets signal or decorator inputs.',
            '`await fixture.whenStable()` is the zoneless-friendly way to let rendering settle.',
            '`fixture.debugElement.query(By.css("button"))` gives a DebugElement; `fixture.nativeElement` gives the real DOM.',
            '`TestBed.inject(Service)` resolves a dependency from the test injector.',
            '`HttpTestingController.expectOne` / `flush` / `verify` test HTTP without a server.',
          ],
        },
        {
          type: 'callout',
          tone: 'warn',
          title: 'detectChanges vs whenStable',
          text: 'Older tutorials call fixture.detectChanges(). In zoneless Angular, prefer await fixture.whenStable() so Angular schedules updates the way production does. detectChanges still works for legacy suites, but it can hide missing notifications.',
        },
        {
          type: 'callout',
          tone: 'interview',
          title: 'What to say about testing',
          text: '"I test behaviour through the DOM and public API, mock at the service boundary, and use HttpTestingController for HTTP. TestBed gives me real DI, so I avoid testing implementation details."',
        },
        {
          type: 'quiz',
          question:
            'You need to test a component that injects ProductApi. What is the cleanest approach?',
          options: [
            'Replace HttpClient with a fake in the component',
            'Provide a mock ProductApi with useValue in TestBed and assert on rendered output',
            'Call the real API in the test',
            'Test the private methods directly',
          ],
          answer: 1,
          explain:
            'Mock at the service boundary with a provider override. The component keeps using inject(ProductApi), and the test controls the data without network access.',
        },
      ],
      takeaways: [
        'TestBed creates an isolated module/injector; setInput drives inputs.',
        'await fixture.whenStable() for zoneless rendering.',
        'HttpTestingController mocks HTTP and verifies requests.',
        'Mock services with useValue; test through the DOM.',
      ],
    },
    {
      id: 'live-coding',
      title: 'The live-coding playbook',
      minutes: 55,
      summary:
        'A complete product-search feature you can adapt under pressure, plus the bug-hunt checklist for "fix this code".',
      blocks: [
        {
          type: 'p',
          text: 'Karat live coding is rarely about obscure APIs. It is about building a small feature cleanly while narrating your decisions. Here is a pattern that covers most prompts: a searchable list with loading, error, empty, and detail states.',
        },
        {
          type: 'steps',
          items: [
            {
              title: 'Clarify (2 minutes)',
              text: 'Ask about the API shape, whether search is client or server side, what happens on error, and whether you should write tests. Repeat the acceptance criteria back.',
            },
            {
              title: 'Scaffold (3 minutes)',
              text: 'Define the interface, create the service, then the component. Say what each file is for. Do not start with CSS.',
            },
            {
              title: 'Build the happy path (15 minutes)',
              text: 'Fetch, render, track. Get something on screen before adding states.',
            },
            {
              title: 'Add the edges (10 minutes)',
              text: 'Loading, error with retry, empty state, disabled submit, unsubscribe/cancellation.',
            },
            {
              title: 'Test and explain (5 minutes)',
              text: 'Walk through one edge case. If time allows, write one test or explain how you would.',
            },
          ],
        },
        {
          type: 'code',
          lang: 'ts',
          title: 'product-search.service.ts',
          code: `import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  id: number;
  name: string;
  price: number;
}

@Injectable({ providedIn: 'root' })
export class ProductSearchService {
  private readonly http = inject(HttpClient);

  search(query: string): Observable<Product[]> {
    return this.http.get<Product[]>('/api/products', { params: { q: query } });
  }
}`,
        },
        {
          type: 'code',
          lang: 'ts',
          title: 'product-search.ts',
          code: `import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Subject, catchError, debounceTime, distinctUntilChanged,
  finalize, of, switchMap, tap
} from 'rxjs';
import { ProductSearchService } from './product-search.service';

@Component({
  selector: 'app-product-search',
  templateUrl: './product-search.html',
  styleUrl: './product-search.css',
})
export class ProductSearch {
  private readonly api = inject(ProductSearchService);
  private readonly terms = new Subject<string>();

  readonly query = signal('');
  readonly loading = signal(false);
  readonly error = signal(false);

  private readonly results = toSignal(
    this.terms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => {
        this.loading.set(true);
        this.error.set(false);
      }),
      switchMap(term =>
        this.api.search(term).pipe(
          catchError(() => {
            this.error.set(true);
            return of([]);
          }),
          finalize(() => this.loading.set(false))
        )
      )
    ),
    { initialValue: [] }
  );

  readonly products = computed(() => this.results());
  readonly isEmpty = computed(
    () => !this.loading() && !this.error() && this.products().length === 0
  );

  onInput(value: string) {
    this.query.set(value);
    this.terms.next(value);
  }

  retry() {
    this.terms.next(this.query());
  }

  clear() {
    this.query.set('');
    this.terms.next('');
  }
}`,
        },
        {
          type: 'code',
          lang: 'html',
          title: 'product-search.html',
          code: `<section class="search">
  <label for="q">Search products</label>
  <input
    id="q"
    type="search"
    [value]="query()"
    (input)="onInput($any($event.target).value)"
    placeholder="Try “keyboard”"
  />
  @if (query()) {
    <button type="button" (click)="clear()">Clear</button>
  }
</section>

@if (loading()) {
  <app-spinner />
} @else if (error()) {
  <p class="error">Could not load products.</p>
  <button type="button" (click)="retry()">Try again</button>
} @else if (isEmpty()) {
  <p class="empty">No products match “{{ query() }}”.</p>
} @else {
  <ul class="results">
    @for (product of products(); track product.id) {
      <li>
        <strong>{{ product.name }}</strong>
        <span>{{ product.price | currency }}</span>
      </li>
    }
  </ul>
}`,
        },
        {
          type: 'callout',
          tone: 'interview',
          title: 'Narrate the trade-offs',
          text: 'While coding, say: "I am using switchMap so a slow earlier request cannot overwrite a newer one. I debounce to avoid a request per keystroke. I track by id so focus and DOM state survive updates." That is the difference between code that works and an interview that passes.',
        },
        {
          type: 'callout',
          tone: 'tip',
          title: 'Accessibility quick wins',
          text: 'Label the search input, give buttons an explicit type, announce async results with `aria-live="polite"`, keep focus stable with `track`, and mark invalid fields with `aria-invalid`. These take seconds and interviewers notice.',
        },
        {
          type: 'h3',
          text: 'The bug-hunt checklist',
        },
        {
          type: 'list',
          items: [
            'Mutating an array/object held in a signal → replace it with set/update.',
            'Missing `track` or tracking by index → use a stable id.',
            'Subscribing in a component without cleanup → AsyncPipe, toSignal, takeUntilDestroyed.',
            'Nested subscribe → switchMap/mergeMap/concatMap.',
            'Plain field mutated in async callback under zoneless → signal or markForCheck.',
            'Using `this` inside a plain callback → arrow function or bind.',
            'Reading `snapshot.paramMap` once when params can change → input binding or observable.',
            'Forgetting to import a directive/pipe in a standalone component → template error.',
            'Form errors shown before touched → guard with `touched`.',
            'Guard returning false without a redirect → user sees a blank navigation.',
          ],
        },
        {
          type: 'callout',
          tone: 'tip',
          title: 'If you get stuck',
          text: 'Say what you know, what you are unsure about, and how you would find out. Interviewers score reasoning and communication, not memorised syntax. Ask for a hint before silently freezing.',
        },
        {
          type: 'quiz',
          question:
            'Your search requests can resolve out of order. Which change is the most direct fix?',
          options: [
            'Add debounceTime only',
            'Use switchMap so each new term cancels the previous request',
            'Add catchError',
            'Convert the observable to a promise',
          ],
          answer: 1,
          explain:
            'switchMap cancels the previous inner subscription when a new term arrives. Debounce reduces requests but does not prevent two in-flight requests from racing if the user pauses.',
        },
      ],
      takeaways: [
        'Clarify → scaffold → happy path → edges → test.',
        'Every data view needs loading, error, empty, and success states.',
        'switchMap for search; track stable ids; clean up subscriptions.',
        'Narrate trade-offs while coding.',
      ],
    },
    {
      id: 'react-answers',
      title: 'Answering from a React background',
      minutes: 30,
      summary:
        'How to bridge your experience without sounding like you are translating React line by line.',
      blocks: [
        {
          type: 'p',
          text: 'Do not apologise for coming from React. Frame it as transferable knowledge: you already understand components, state, derived values, effects, and unidirectional data flow. Then name the Angular mechanism.',
        },
        {
          type: 'qa',
          items: [
            {
              q: 'How would you manage shared state in Angular?',
              a: 'A root-provided service holding signals. Components inject it and read computed values. For async streams I would use RxJS and expose a signal with toSignal. I would only add NgRx if the app needs event sourcing, time travel, or a large team convention.',
            },
            {
              q: 'How do you handle side effects?',
              a: 'Effects that touch non-Angular APIs use effect() or lifecycle hooks. Data fetching is an RxJS stream with switchMap or a resource. I avoid using effect() to derive state; computed() is the right tool for that.',
            },
            {
              q: 'How do you pass data between components?',
              a: 'Inputs down, outputs up, model() for two-way, content projection for markup, and a shared service for siblings. I pick the smallest pattern that fits the relationship.',
            },
            {
              q: 'How do you optimise rendering?',
              a: 'Signals plus OnPush (the default in v22), stable track ids, computed instead of template calls, lazy routes, and @defer for heavy widgets. I measure with Angular DevTools first.',
            },
            {
              q: 'How do you structure a feature?',
              a: 'A route-level page component, a feature service for state and API calls, dumb child components with inputs/outputs, and a typed model. Keep HTTP in the service, not the component.',
            },
            {
              q: 'How do you test Angular code?',
              a: 'TestBed with real DI, drive inputs with setInput, assert through the DOM, mock services at the boundary, and use HttpTestingController for HTTP. In zoneless apps I await whenStable().',
            },
            {
              q: 'What is the biggest difference from React?',
              a: 'Angular is a full framework with DI, RxJS, routing, forms, and HTTP built in, and it compiles templates instead of diffing a virtual DOM. React gives you a rendering model and lets you choose the rest.',
            },
            {
              q: 'What would you need to learn on the job?',
              a: 'The project’s conventions: state management, RxJS patterns, form strategy, testing stack, and build setup. The fundamentals transfer; the architecture is what changes.',
            },
          ],
        },
        {
          type: 'table',
          headers: ['If they ask…', 'Lead with…'],
          rows: [
            ['"Why Angular?"', 'Batteries included, strong typing, DI, and a consistent structure for large teams.'],
            ['"React vs Angular?"', 'Library vs framework; JSX vs compiled templates; hooks vs signals/RxJS.'],
            ['"How would you build X?"', 'Route → page component → service → typed HTTP → signals → template states.'],
            ['"How do you debug?"', 'DevTools, signal graph, network tab, breakpoints, smallest reproduction, tests.'],
            ['"Tell me about a hard bug"', 'A concrete story: symptom, hypothesis, instrumentation, fix, regression test.'],
          ],
        },
        {
          type: 'callout',
          tone: 'interview',
          title: 'Do not fake depth',
          text: 'If you have not used NgRx or SSR, say so and explain how you would approach it. Interviewers can tell. "I have not used NgRx in production, but I understand it is a Redux-style store with effects; I would start with a service and add it when the state graph justifies it" is a strong answer.',
        },
        {
          type: 'callout',
          tone: 'tip',
          title: 'Use their vocabulary',
          text: 'Say component, template, binding, service, injector, signal, observable, guard, interceptor. Using the framework’s language signals that you can join the codebase on day one.',
        },
      ],
      takeaways: [
        'Frame React experience as transferable, not as a disadvantage.',
        'Name the Angular mechanism, not just the concept.',
        'Prefer services + signals before reaching for a store.',
        'Be honest about gaps and describe how you would close them.',
      ],
    },
    {
      id: 'rapid-fire',
      title: 'Rapid-fire question bank',
      minutes: 40,
      summary:
        'Thirty-four questions with interview-ready answers. Cover the answer, then say it out loud.',
      blocks: [
        {
          type: 'p',
          text: 'Read the question, answer out loud, then open it. Aim for 20–30 seconds per answer. If you cannot, that is your review list for tomorrow morning.',
        },
        {
          type: 'qa',
          items: [
            {
              q: 'What is Angular?',
              a: 'A TypeScript-first frontend framework with components, templates, dependency injection, routing, forms, HTTP, and testing built in. It compiles templates ahead of time and uses change detection rather than a virtual DOM.',
            },
            {
              q: 'Component vs directive?',
              a: 'A component is a directive with a template and a view. Attribute directives change the appearance or behaviour of an existing element (ngClass). Structural directives change the DOM structure (*ngIf, @if).',
            },
            {
              q: 'What is a standalone component?',
              a: 'A component that declares its own template dependencies in its imports array and does not need an NgModule. It is the default since Angular 19.',
            },
            {
              q: 'What is a signal?',
              a: 'A reactive value wrapper. Reading it registers a dependency; set/update notifies Angular. Signals drive precise change detection and derived state via computed().',
            },
            {
              q: 'computed vs effect?',
              a: 'computed derives a value lazily and memoises it. effect runs a side effect when its dependencies change and is for non-reactive APIs, not state derivation.',
            },
            {
              q: 'What is linkedSignal?',
              a: 'A writable signal whose default value is derived from another signal, but which can still be overridden. Useful for selection state that resets when a list changes.',
            },
            {
              q: 'What is a resource?',
              a: 'A signal-based async data primitive with value, status, error, loading, and reload. It keeps async data in the same reactive graph as the rest of the view state.',
            },
            {
              q: 'How does change detection work?',
              a: 'Angular tracks bindings and dirty views. Signals, events, inputs, AsyncPipe, and markForCheck notify it. In zoneless apps no Zone.js is needed; OnPush is the default in v22.',
            },
            {
              q: 'What is OnPush?',
              a: 'A strategy where a component is skipped unless an input changes, an event fires, a signal it reads changes, an AsyncPipe emits, or markForCheck is called. It reduces checks and is the default in Angular 22.',
            },
            {
              q: 'What is Zone.js and why remove it?',
              a: 'A library that patches async browser APIs to trigger change detection. It causes unnecessary checks, adds bundle size, and complicates debugging. Zoneless relies on explicit notifications instead.',
            },
            {
              q: 'Lifecycle hook order?',
              a: 'ngOnChanges → ngOnInit → ngDoCheck → ngAfterContentInit → ngAfterContentChecked → ngAfterViewInit → ngAfterViewChecked → ngOnDestroy.',
            },
            {
              q: 'Constructor vs ngOnInit?',
              a: 'The constructor runs when the class is instantiated; inputs are not set yet. ngOnInit runs once after the first input binding, so use it for setup that depends on inputs.',
            },
            {
              q: 'Subject vs BehaviorSubject?',
              a: 'Both are multicast. BehaviorSubject stores and replays the latest value to new subscribers; Subject does not. Use BehaviorSubject for current state, Subject for events.',
            },
            {
              q: 'Cold vs hot observable?',
              a: 'A cold observable creates a new producer per subscription (HttpClient). A hot observable shares a producer (DOM events, Subject).',
            },
            {
              q: 'switchMap vs mergeMap?',
              a: 'switchMap cancels the previous inner observable; mergeMap runs all concurrently. Use switchMap for latest-wins (search), mergeMap for independent parallel work, concatMap for order.',
            },
            {
              q: 'How do you unsubscribe?',
              a: 'Use AsyncPipe, toSignal, or takeUntilDestroyed. For imperative subscriptions, tie them to DestroyRef. Avoid manual arrays of subscriptions when a declarative option exists.',
            },
            {
              q: 'Observable vs Promise?',
              a: 'An Observable can emit many values, is lazy, and is cancellable. A Promise resolves once, starts eagerly, and is not cancellable without AbortController.',
            },
            {
              q: 'What is dependency injection?',
              a: 'A pattern where a class declares what it needs and an injector provides it. Angular has a hierarchical injector tree; providers at root, route, or component scope control instance lifetime.',
            },
            {
              q: 'What does providedIn: root mean?',
              a: 'The service is a tree-shakable application-wide singleton, available anywhere without being listed in a providers array.',
            },
            {
              q: '@Service vs @Injectable?',
              a: 'Angular 22’s @Service is shorthand for a root-provided injectable that uses inject() and supports a factory. @Injectable is still needed for constructor injection, custom provider keys, and non-root scopes.',
            },
            {
              q: 'How do components communicate?',
              a: 'input() down, output() up, model() both ways, ng-content for markup, viewChild for template access, and a shared service for siblings or distant components.',
            },
            {
              q: 'What is content projection?',
              a: 'Passing markup from a parent into a child via ng-content. select lets the child route projected content into named slots. It is Angular’s children/slots.',
            },
            {
              q: 'Reactive vs template-driven forms?',
              a: 'Reactive forms keep a typed model in the class, which is testable and good for complex/dynamic validation. Template-driven forms use ngModel and are simpler for tiny forms.',
            },
            {
              q: 'How do you validate a form?',
              a: 'Add validators to controls (required, email, minLength) or a schema in signal forms. Show errors after touched; disable submit while invalid; markAllAsTouched on submit.',
            },
            {
              q: 'How does lazy loading work?',
              a: 'Routes use loadComponent or loadChildren to import code on demand, creating separate bundles. The router downloads the chunk when the route activates.',
            },
            {
              q: 'Guard vs resolver?',
              a: 'A guard decides whether navigation can proceed (canActivate, canMatch) and can redirect. A resolver preloads data before the route activates.',
            },
            {
              q: 'What is an interceptor?',
              a: 'HTTP middleware. It can clone requests to add headers, retry, log, or handle errors globally. Modern Angular uses functional interceptors with withInterceptors().',
            },
            {
              q: 'Pure vs impure pipe?',
              a: 'A pure pipe re-runs only when its input reference changes. An impure pipe runs every change detection cycle. Prefer pure pipes and computed signals.',
            },
            {
              q: 'What does AsyncPipe do?',
              a: 'Subscribes to an observable or promise, renders the latest value, unsubscribes on destroy, and marks the view for check when a value arrives.',
            },
            {
              q: 'Why does @for need track?',
              a: 'It gives each item a stable identity so Angular can reuse DOM nodes and preserve state when the list changes. Track a unique id, not the index.',
            },
            {
              q: 'What is @defer?',
              a: 'A template block that lazy-loads its content and dependencies when a trigger fires (viewport, idle, interaction, timer, or a custom trigger). It supports placeholder, loading, and error blocks.',
            },
            {
              q: 'How do you prevent XSS?',
              a: 'Angular escapes interpolation by default and sanitises values bound to innerHTML, URLs, and styles. Avoid bypassSecurityTrustHtml unless the content is trusted. Use the DomSanitizer deliberately.',
            },
            {
              q: 'AOT vs JIT?',
              a: 'AOT compiles templates at build time, catching template errors early and producing smaller, faster bundles. JIT compiles in the browser and is mainly for development or dynamic compilation.',
            },
            {
              q: 'How do you test a component?',
              a: 'Configure TestBed with the standalone component, set inputs with componentRef.setInput, await whenStable, interact with the DOM, and assert rendered output. Mock services at the boundary.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'tip',
          title: 'How to use this list',
          text: 'Do not memorise all 34 verbatim. Memorise the shape of each answer: definition, mechanism, when to use it, and one trade-off. That is what sounds like experience.',
        },
      ],
      takeaways: [
        'Answer in 20–30 seconds: definition, mechanism, trade-off.',
        'Know the modern defaults: standalone, zoneless, OnPush, signals.',
        'Know the legacy names so you can read older code.',
        'Revisit any question you could not answer out loud.',
      ],
    },
    {
      id: 'mock-interview',
      title: 'The 60-minute mock interview',
      minutes: 35,
      summary:
        'Run this once, timed, without notes. Then score yourself against the rubric.',
      blocks: [
        {
          type: 'p',
          text: 'Set a timer. Share your screen with a blank file if you can. Talk out loud the entire time. The goal is not a perfect implementation; it is visible, structured reasoning.',
        },
        {
          type: 'table',
          headers: ['Time', 'Segment', 'What to do'],
          rows: [
            ['0–5 min', 'Intro', 'Two-minute background. Emphasise shipped UI, state, testing, and collaboration.'],
            ['5–12 min', 'Fundamentals', 'Answer 3–4 rapid-fire questions. Lead with the mechanism, then the trade-off.'],
            ['12–45 min', 'Live coding', 'Build the product search feature. Clarify, scaffold, happy path, edges, narrate.'],
            ['45–55 min', 'Follow-ups', 'Performance, testing, accessibility, error handling, what you would do with more time.'],
            ['55–60 min', 'Your questions', 'Ask about the team’s Angular version, state strategy, and what success looks like.'],
          ],
        },
        {
          type: 'h3',
          text: 'The prompt',
        },
        {
          type: 'callout',
          tone: 'why',
          title: 'Build a product search page',
          text: 'Requirements: a search input that queries /api/products?q=…; results show name and price; debounce input; cancel stale requests; show loading, empty, and error states with retry; selecting a result shows a detail panel; the list must preserve focus and scroll when results update; include one test. You may use any Angular APIs you like.',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'Define the Product interface and the service method.',
            'Create the component with a query signal and a terms Subject.',
            'Pipe through debounceTime, distinctUntilChanged, switchMap.',
            'Expose results with toSignal and a loading signal.',
            'Render with @if / @for and track by id.',
            'Add an error state with retry and an empty state.',
            'Add a selected signal and a detail panel.',
            'Write one test for the empty state or the service request.',
            'Explain what you would add with more time: URL state, accessibility, caching, tests.',
          ],
        },
        {
          type: 'h3',
          text: 'Score yourself',
        },
        {
          type: 'table',
          headers: ['Area', '1 — Weak', '3 — Solid', '5 — Strong'],
          rows: [
            ['Clarification', 'Starts coding immediately', 'Asks about API and edge cases', 'Restates acceptance criteria and constraints'],
            ['Angular fluency', 'Fights syntax', 'Inputs, signals, control flow correct', 'Idiomatic: signals, DI, RxJS, lazy patterns'],
            ['State design', 'Scattered booleans', 'Clear signals and derived values', 'Minimal state, computed derivations, no duplication'],
            ['Async handling', 'Nested subscribes / leaks', 'switchMap + cleanup', 'Cancellation, errors, retry, loading modelled explicitly'],
            ['Communication', 'Silent', 'Narrates steps', 'Explains trade-offs and alternatives'],
            ['Testing', 'No tests', 'One meaningful test', 'Behaviour-focused, edge cases, mocks at boundary'],
          ],
        },
        {
          type: 'callout',
          tone: 'interview',
          title: 'Follow-ups to rehearse',
          text: '"How would you make this accessible?" "How would you cache results?" "What if the API returned paginated data?" "How would you test the debounce?" "What would you change if this list had 10,000 rows?" (virtual scrolling, server pagination, track, OnPush, defer.)',
        },
        {
          type: 'callout',
          tone: 'tip',
          title: 'Ask good questions at the end',
          text: 'What Angular version is the team on? Signals or RxJS-first? How do you handle state? What does a successful first 90 days look like? Questions about the actual work signal genuine interest.',
        },
      ],
      takeaways: [
        'Timebox: clarify, scaffold, happy path, edges, test.',
        'Narrate trade-offs; silence is the enemy.',
        'Every data view needs loading/error/empty states.',
        'Finish with questions about the team and codebase.',
      ],
    },
    {
      id: 'last-hour',
      title: 'The last-hour checklist',
      minutes: 15,
      summary:
        'What to review on interview morning, what to bring, and how to recover if your mind goes blank.',
      blocks: [
        {
          type: 'p',
          text: 'Do not learn anything new in the last hour. Review the high-yield list, say a few answers out loud, and set up your environment.',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'Read the React → Angular cheat sheet once. Cover the Angular column and recall it.',
            'Say the change detection answer, the DI answer, and the signals-vs-RxJS answer out loud.',
            'Recite the live-coding sequence: clarify → scaffold → happy path → edges → test.',
            'Skim the bug-hunt checklist. Mutation, track, subscriptions, zoneless updates, stale params.',
            'Open the docs tabs you might need: angular.dev, RxJS operators, your notes.',
            'Test your mic, camera, screen share, and editor font size.',
            'Have a blank Angular project or StackBlitz ready if the platform allows it.',
            'Write down the acceptance criteria during the prompt. Repeat them back.',
            'Breathe. If you blank, say what you know and ask a clarifying question.',
          ],
        },
        {
          type: 'callout',
          tone: 'interview',
          title: 'If you blank on syntax',
          text: 'Describe the intent in plain English and write pseudocode. "I need a service that exposes a signal, a component that injects it, and a template that loops with track." Then fill in syntax. Interviewers care more about the shape than perfect recall.',
        },
        {
          type: 'h3',
          text: 'The five answers to have cold',
        },
        {
          type: 'qa',
          items: [
            {
              q: 'Why Angular over React?',
              a: 'A complete, typed framework with DI, routing, forms, HTTP, and testing conventions. That consistency pays off in large teams and long-lived codebases.',
            },
            {
              q: 'How does change detection work?',
              a: 'Angular marks views dirty through signals, events, inputs, AsyncPipe, and markForCheck, then checks only dirty OnPush components. Zoneless removes the need for Zone.js.',
            },
            {
              q: 'Signals or RxJS?',
              a: 'Signals for synchronous view state and derivations; RxJS for async streams, cancellation, and event composition. They interoperate with toSignal and toObservable.',
            },
            {
              q: 'How do you structure a feature?',
              a: 'Route-level page, feature service for state/API, presentational children with inputs/outputs, typed models, and tests at the service and component boundary.',
            },
            {
              q: 'How do you handle errors?',
              a: 'Catch at the boundary, show a retryable error state, log centrally through an interceptor or error handler, and never swallow errors silently.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'tip',
          title: 'You are ready when…',
          text: 'You can build the product search feature from a blank file in 30 minutes, explain every choice, and name one thing you would improve. That is the bar. Everything else is vocabulary.',
        },
      ],
      takeaways: [
        'Review, do not learn, in the last hour.',
        'Have the five core answers cold.',
        'Set up environment and reduce friction.',
        'Narrate intent when syntax escapes you.',
      ],
    },
  ],
};
