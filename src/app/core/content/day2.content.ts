import { StudyDay } from '../content.models';

export const DAY_TWO: StudyDay = {
  id: '2',
  label: 'Day 02',
  title: 'Architecture and data',
  subtitle: 'Services, DI, RxJS, HTTP, routing, forms, and change detection.',
  duration: '5–6 hours',
  goal: 'By tonight you can build a small feature end to end: route → service → HTTP → form → list.',
  lessons: [
    {
      id: 'services-di',
      title: 'Services and dependency injection',
      minutes: 45,
      summary:
        'The Angular superpower React does not have built in: a real injector tree, singleton services, tokens, and testable seams.',
      blocks: [
        {
          type: 'p',
          text: 'A service is a class that holds shared logic or state. Dependency injection (DI) is how Angular creates it and hands it to whoever asks. You almost never call `new` on a service.',
        },
        {
          type: 'code',
          lang: 'ts',
          title: 'cart.service.ts — the modern form',
          code: `import { computed, Injectable, signal } from '@angular/core';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly itemsState = signal<CartItem[]>([]);

  // Expose read-only state; keep writes behind methods.
  readonly items = this.itemsState.asReadonly();
  readonly count = computed(() =>
    this.items().reduce((sum, item) => sum + item.qty, 0)
  );
  readonly total = computed(() =>
    this.items().reduce((sum, item) => sum + item.price * item.qty, 0)
  );

  add(item: Omit<CartItem, 'qty'>) {
    this.itemsState.update(items => {
      const existing = items.find(i => i.id === item.id);
      return existing
        ? items.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
        : [...items, { ...item, qty: 1 }];
    });
  }

  remove(id: number) {
    this.itemsState.update(items => items.filter(i => i.id !== id));
  }
}`,
        },
        {
          type: 'code',
          lang: 'ts',
          title: 'Using it in a component',
          code: `import { Component, inject } from '@angular/core';
import { CartService } from './cart.service';

@Component({
  selector: 'app-cart-button',
  templateUrl: './cart-button.html',
})
export class CartButton {
  private readonly cart = inject(CartService);
  readonly count = this.cart.count;
  readonly total = this.cart.total;

  add() {
    this.cart.add({ id: 1, name: 'Mechanical keyboard', price: 129 });
  }
}`,
        },
        {
          type: 'p',
          text: '`providedIn: \'root\'` creates one instance for the application and makes it tree-shakable: if nothing injects it, it is removed from the bundle. Angular 22 also offers `@Service()`, a shorter decorator that implies root provisioning and uses `inject()` only.',
        },
        {
          type: 'code',
          lang: 'ts',
          title: 'Angular 22 shorthand',
          code: `import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Service()
export class Analytics {
  private readonly http = inject(HttpClient);

  track(event: string) {
    this.http.post('/api/events', { event }).subscribe();
  }
}

// Equivalent to:
// @Injectable({ providedIn: 'root' })
// export class Analytics { ... }`,
        },
        {
          type: 'callout',
          tone: 'warn',
          title: '@Service is not a drop-in replacement',
          text: '@Service supports inject() but not constructor parameter injection, and it does not expose useClass/useValue/useExisting. Keep using @Injectable for advanced provider configuration or non-root scopes. If the project is on Angular 20 or earlier, @Service does not exist.',
        },
        {
          type: 'h3',
          text: 'The injector tree',
        },
        {
          type: 'p',
          text: 'Angular has a hierarchy of injectors. A component-level `providers` array creates a new instance for that component and its descendants. Route-level providers live as long as the route. The root injector holds app-wide singletons. When a component asks for a dependency, Angular walks up the tree until it finds a provider.',
        },
        {
          type: 'code',
          lang: 'ts',
          title: 'Component-scoped instance',
          code: `@Component({
  selector: 'app-editor',
  templateUrl: './editor.html',
  providers: [DraftService], // new instance per editor
})
export class Editor {
  private readonly draft = inject(DraftService);
}`,
        },
        {
          type: 'code',
          lang: 'ts',
          title: 'Injection tokens for configuration',
          code: `import { InjectionToken, inject } from '@angular/core';

export const API_URL = new InjectionToken<string>('API_URL');

// app.config.ts
providers: [{ provide: API_URL, useValue: 'https://api.example.com' }]

// anywhere
private readonly apiUrl = inject(API_URL);`,
        },
        {
          type: 'callout',
          tone: 'interview',
          title: 'DI in one answer',
          text: '"Angular has a hierarchical injector. Services are provided at root, route, or component level, and inject() resolves from the nearest provider. That gives us singletons by default, scoped instances when needed, and easy substitution in tests."',
        },
        {
          type: 'callout',
          tone: 'warn',
          title: 'inject() has a context',
          text: 'Call inject() in a constructor, field initialiser, factory, guard, interceptor, or resolver. It will throw outside an injection context. If you truly need it later, wrap the call in runInInjectionContext(injector, () => ...).',
        },
        {
          type: 'quiz',
          question:
            'You add `providers: [CartService]` to a product component. What changes?',
          options: [
            'Nothing; root services always win.',
            'Every component in the app gets a new CartService.',
            'That component and its children get their own CartService instance instead of the root one.',
            'The service can no longer use inject().',
          ],
          answer: 2,
          explain:
            'Component providers create an injector at that component. It and its descendants resolve CartService from there, while the rest of the app still uses the root instance. This is useful for isolated state, such as one draft per editor.',
        },
      ],
      takeaways: [
        'Services hold shared state and logic; inject() retrieves them.',
        'providedIn root = app-wide singleton, tree-shakable.',
        '@Service() is the Angular 22 shorthand; @Injectable is still essential.',
        'Component/route providers create scoped instances.',
        'InjectionToken provides typed configuration without string keys.',
      ],
    },
    {
      id: 'rxjs',
      title: 'RxJS without the fear',
      minutes: 50,
      summary:
        'Observables vs promises, the six operators that cover most interview code, and how to avoid the subscription leak.',
      blocks: [
        {
          type: 'p',
          text: 'RxJS is a library for streams. An Observable is a recipe for a sequence of values over time. It is lazy: nothing happens until you subscribe. That one sentence explains most bugs.',
        },
        {
          type: 'table',
          headers: ['', 'Promise', 'Observable'],
          rows: [
            ['Values', 'Exactly one', 'Zero, one, or many'],
            ['Eager?', 'Starts immediately', 'Lazy; starts on subscribe'],
            ['Cancellable?', 'No (without AbortController)', 'Yes; unsubscribe cancels'],
            ['Operators', 'then / catch', 'map, filter, switchMap, catchError…'],
            ['Angular use', 'One-off async', 'HTTP, events, router params, state streams'],
          ],
        },
        {
          type: 'code',
          lang: 'ts',
          title: 'The operators that matter',
          code: `import { of, from, Subject, BehaviorSubject, combineLatest, forkJoin } from 'rxjs';
import {
  map, filter, tap, switchMap, mergeMap, concatMap,
  catchError, debounceTime, distinctUntilChanged,
  takeUntilDestroyed
} from 'rxjs/operators';

// Transform and filter
of(1, 2, 3, 4).pipe(
  filter(n => n % 2 === 0),
  map(n => n * 10)
).subscribe(console.log); // 20, 40

// One request per search term; cancel the previous request
searchTerms.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(term => api.search(term)),
  catchError(() => of([]))
).subscribe(results => this.results.set(results));

// Wait for both
forkJoin({
  user: api.getUser(1),
  orders: api.getOrders(1),
}).subscribe(({ user, orders }) => { /* ... */ });

// React to either
combineLatest([query$, page$]).pipe(
  switchMap(([query, page]) => api.search(query, page))
).subscribe();`,
        },
        {
          type: 'h3',
          text: 'Subject vs BehaviorSubject',
        },
        {
          type: 'p',
          text: 'A `Subject` is both an Observable and an Observer: you can push values with `next()`. A `BehaviorSubject` also stores the latest value and replays it to new subscribers. Use a BehaviorSubject for "current value" streams, a Subject for events.',
        },
        {
          type: 'code',
          lang: 'ts',
          code: `private readonly query$ = new BehaviorSubject<string>('');

readonly results$ = this.query$.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(query => this.api.search(query))
);

setQuery(query: string) {
  this.query$.next(query);
}`,
        },
        {
          type: 'h3',
          text: 'The leak and the fix',
        },
        {
          type: 'compare',
          react: `useEffect(() => {
  const controller = new AbortController();
  fetch('/api/products', { signal: controller.signal })
    .then(r => r.json())
    .then(setProducts);

  return () => controller.abort();
}, []);`,
          angular: `private readonly destroyRef = inject(DestroyRef);

ngOnInit() {
  this.api.getProducts()
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(products => this.products.set(products));
}`,
          lang: 'ts',
          caption:
            'takeUntilDestroyed completes the subscription when the component is destroyed. AsyncPipe and toSignal do the same automatically.',
        },
        {
          type: 'p',
          text: 'Long-lived subscriptions in a component must be cleaned up. The three good options are `async` pipe, `toSignal()`, or `takeUntilDestroyed()`. Nested `subscribe()` calls are a smell — use a higher-order mapping operator instead.',
        },
        {
          type: 'table',
          headers: ['Operator', 'Behaviour', 'Use when'],
          rows: [
            ['switchMap', 'Cancels the previous inner observable', 'Search, route params, latest-wins'],
            ['mergeMap', 'Runs all inner observables concurrently', 'Independent writes that can overlap'],
            ['concatMap', 'Queues inner observables in order', 'Ordered writes / sequential uploads'],
            ['exhaustMap', 'Ignores new values while busy', 'Double-submit protection'],
          ],
        },
        {
          type: 'callout',
          tone: 'interview',
          title: 'The classic RxJS question',
          text: '"Why switchMap instead of mergeMap for search?" Because switchMap cancels the in-flight request when a new term arrives, so an older response cannot overwrite a newer one. mergeMap would let them race.',
        },
        {
          type: 'callout',
          tone: 'tip',
          title: 'Signals ↔ RxJS',
          text: 'toSignal(observable$, { initialValue }) gives you a signal that unsubscribes with the injection context. toObservable(signal) turns a signal into a stream. Use signals for view state, RxJS for event composition and cancellation.',
        },
        {
          type: 'quiz',
          question:
            'A search box fires a request on every keystroke and old responses sometimes overwrite new ones. Which operator fixes this?',
          options: ['mergeMap', 'concatMap', 'switchMap', 'forkJoin'],
          answer: 2,
          explain:
            'switchMap unsubscribes from the previous inner observable when a new outer value arrives, cancelling the stale request. combine it with debounceTime and distinctUntilChanged for a robust search.',
        },
        {
          type: 'quiz',
          question: 'What does an Observable do before it is subscribed to?',
          options: [
            'Runs immediately and buffers values',
            'Nothing — it is a lazy recipe',
            'Throws an error',
            'Converts itself to a Promise',
          ],
          answer: 1,
          explain:
            'Observables are lazy. The producer runs when subscribe() is called (or when AsyncPipe/toSignal subscribes). This is why an HttpClient call does not fire until something subscribes.',
        },
      ],
      takeaways: [
        'Observables are lazy, cancellable streams; promises are eager single values.',
        'switchMap for latest-wins; mergeMap concurrent; concatMap ordered.',
        'Use async pipe, toSignal, or takeUntilDestroyed to avoid leaks.',
        'Subject pushes events; BehaviorSubject replays the latest value.',
      ],
    },
    {
      id: 'http',
      title: 'HTTP and async data',
      minutes: 40,
      summary:
        'HttpClient, typed responses, functional interceptors, error handling, and the signal-based resource pattern.',
      blocks: [
        {
          type: 'p',
          text: '`HttpClient` returns a cold Observable of a typed response. Register it once with `provideHttpClient()`, inject it where needed, and let the template subscribe through AsyncPipe or `toSignal`.',
        },
        {
          type: 'code',
          lang: 'ts',
          title: 'app.config.ts',
          code: `import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
  ],
};`,
        },
        {
          type: 'code',
          lang: 'ts',
          title: 'product-api.ts',
          code: `import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  id: number;
  name: string;
  price: number;
}

@Injectable({ providedIn: 'root' })
export class ProductApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/products';

  list(query = '', page = 1): Observable<Product[]> {
    const params = new HttpParams()
      .set('q', query)
      .set('page', page);

    return this.http.get<Product[]>(this.baseUrl, { params });
  }

  get(id: number): Observable<Product> {
    return this.http.get<Product>(this.baseUrl + '/' + id);
  }

  create(payload: Omit<Product, 'id'>): Observable<Product> {
    return this.http.post<Product>(this.baseUrl, payload);
  }
}`,
        },
        {
          type: 'code',
          lang: 'ts',
          title: 'Functional interceptor',
          code: `import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token();
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: 'Bearer ' + token } })
    : req;

  return next(authReq).pipe(
    catchError(error => {
      console.error('Request failed', error.status);
      return throwError(() => error);
    })
  );
};`,
        },
        {
          type: 'h3',
          text: 'Three ways to consume it',
        },
        {
          type: 'code',
          lang: 'ts',
          title: '1. AsyncPipe (classic)',
          code: `readonly products$ = this.api.list();

// template: @for (p of products$ | async; track p.id) { ... }`,
        },
        {
          type: 'code',
          lang: 'ts',
          title: '2. toSignal (signal-first)',
          code: `import { toSignal } from '@angular/core/rxjs-interop';

readonly products = toSignal(this.api.list(), { initialValue: [] });
// template: @for (p of products(); track p.id) { ... }`,
        },
        {
          type: 'code',
          lang: 'ts',
          title: '3. resource (loading + error state built in)',
          code: `import { resource } from '@angular/core';
import { firstValueFrom } from 'rxjs';

readonly products = resource({
  loader: () => firstValueFrom(this.api.list()),
});

// template:
// @if (products.isLoading()) { <app-spinner /> }
// @if (products.error()) { <p>Could not load products.</p> }
// @for (p of products.value() ?? []; track p.id) { ... }
// <button (click)="products.reload()">Retry</button>`,
        },
        {
          type: 'callout',
          tone: 'warn',
          title: 'Handle loading and error, not just success',
          text: 'In an interview, a fetch that only handles the happy path reads as junior. Show a loading state, an error state with retry, and an empty state. It takes three lines and demonstrates product thinking.',
        },
        {
          type: 'callout',
          tone: 'interview',
          title: 'Interceptors',
          text: 'An interceptor is middleware for HTTP. Use it for auth headers, base URLs, retries, logging, and global error handling. Modern Angular uses functional interceptors registered with withInterceptors([...]).',
        },
        {
          type: 'quiz',
          question:
            'Why does calling `this.api.list()` in a component constructor not send a request?',
          options: [
            'HttpClient only works in ngOnInit.',
            'The returned Observable is cold and lazy; it runs on subscribe.',
            'The request is batched until change detection runs.',
            'You must call .then() on it.',
          ],
          answer: 1,
          explain:
            'HttpClient returns a cold Observable. AsyncPipe, toSignal, resource, or an explicit subscribe starts it. This laziness is also what makes retry and cancellation composable.',
        },
      ],
      takeaways: [
        'provideHttpClient() once; inject(HttpClient) anywhere.',
        'Type every response: http.get<Product[]>(...).',
        'Functional interceptors handle auth, retries, and errors.',
        'Always model loading, error, empty, and success states.',
      ],
    },
    {
      id: 'routing',
      title: 'Routing and navigation',
      minutes: 45,
      summary:
        'Route tables, lazy loading, params as inputs, guards, resolvers, and the router APIs interviewers expect.',
      blocks: [
        {
          type: 'p',
          text: 'Angular Router is a first-party, configuration-driven router. Routes map URL segments to components. Feature areas are lazy-loaded by default in modern apps.',
        },
        {
          type: 'code',
          lang: 'ts',
          title: 'app.routes.ts',
          code: `import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(m => m.HomePage),
    title: 'Home',
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./pages/products/products').then(m => m.ProductsPage),
    title: 'Products',
  },
  {
    path: 'products/:id',
    loadComponent: () =>
      import('./pages/product-detail/product-detail').then(m => m.ProductDetailPage),
    canActivate: [authGuard],
    title: 'Product details',
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canMatch: [adminGuard],
  },
  { path: '**', redirectTo: '' },
];`,
        },
        {
          type: 'code',
          lang: 'html',
          title: 'Navigation in a template',
          code: `<nav>
  <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
    Home
  </a>
  <a routerLink="/products" routerLinkActive="active">Products</a>
  <a [routerLink]="['/products', product.id]">View</a>
</nav>

<router-outlet />`,
        },
        {
          type: 'h3',
          text: 'Route params as inputs',
        },
        {
          type: 'p',
          text: 'With `withComponentInputBinding()`, route params, query params, and resolved data bind directly to component inputs. No ActivatedRoute boilerplate.',
        },
        {
          type: 'code',
          lang: 'ts',
          title: 'product-detail.ts',
          code: `import { Component, input, numberAttribute } from '@angular/core';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.html',
})
export class ProductDetailPage {
  // /products/42 -> id = 42
  readonly id = input.required({ transform: numberAttribute });
}`,
        },
        {
          type: 'p',
          text: 'Without input binding, inject `ActivatedRoute` and read `route.paramMap` or `route.snapshot.paramMap`. Use the observable form when the same component can be reused across different ids; the component is not recreated when only params change.',
        },
        {
          type: 'code',
          lang: 'ts',
          title: 'Guard and resolver',
          code: `import { inject } from '@angular/core';
import { CanActivateFn, ResolveFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn() ? true : router.createUrlTree(['/login']);
};

export const productResolver: ResolveFn<Product> = (route) => {
  const api = inject(ProductApi);
  return api.get(Number(route.paramMap.get('id')));
};`,
        },
        {
          type: 'code',
          lang: 'ts',
          title: 'Programmatic navigation',
          code: `private readonly router = inject(Router);

goToProduct(id: number) {
  this.router.navigate(['/products', id], {
    queryParams: { tab: 'reviews' },
  });
}`,
        },
        {
          type: 'callout',
          tone: 'interview',
          title: 'Lazy loading and guards',
          text: 'Lazy loading splits features into separate bundles with loadComponent/loadChildren. Guards decide whether navigation can happen (canActivate, canMatch); resolvers preload data before activation. Functional guards are just functions that use inject().',
        },
        {
          type: 'callout',
          tone: 'warn',
          title: 'Param changes do not recreate the component',
          text: 'Navigating from /products/1 to /products/2 reuses the component. A one-time read of snapshot.paramMap will be stale. Use an input binding, an observable paramMap with switchMap, or subscribe to router events.',
        },
        {
          type: 'quiz',
          question:
            'Which API lazy-loads a single standalone page component in a route?',
          options: [
            'component: ProductsPage',
            'loadComponent: () => import(...).then(m => m.ProductsPage)',
            'loadChildren: () => ProductsPage',
            'children: [ProductsPage]',
          ],
          answer: 1,
          explain:
            'loadComponent lazy-loads one standalone component. loadChildren lazy-loads a set of child routes, usually from a separate routes file.',
        },
      ],
      takeaways: [
        'Routes are a typed array; lazy-load features with loadComponent/loadChildren.',
        'routerLink + routerLinkActive handle navigation and active styles.',
        'withComponentInputBinding turns params into inputs.',
        'Functional guards/resolvers are injectable functions.',
      ],
    },
    {
      id: 'forms',
      title: 'Forms: reactive, template-driven, and signal',
      minutes: 50,
      summary:
        'Pick the right form model, build a typed reactive form, and recognise the new signal forms API.',
      blocks: [
        {
          type: 'p',
          text: 'Angular has three form approaches. For interviews, know the trade-offs and be able to write a reactive form from memory.',
        },
        {
          type: 'table',
          headers: ['Approach', 'Model lives in', 'Best for', 'Import'],
          rows: [
            ['Template-driven', 'Template (ngModel)', 'Tiny forms, simple validation', 'FormsModule'],
            ['Reactive', 'Component class (FormGroup)', 'Complex, dynamic, testable forms', 'ReactiveFormsModule'],
            ['Signal forms', 'Signals + schema', 'New signal-first apps (Angular 21+)', '@angular/forms/signals'],
          ],
        },
        {
          type: 'code',
          lang: 'ts',
          title: 'Typed reactive form',
          code: `import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule],
  templateUrl: './signup.html',
})
export class Signup {
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    plan: ['free' as 'free' | 'pro'],
  });

  readonly email = this.form.controls.email;

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // getRawValue() is fully typed and includes disabled controls
    const value = this.form.getRawValue();
    console.log(value);
  }
}`,
        },
        {
          type: 'code',
          lang: 'html',
          title: 'signup.html',
          code: `<form [formGroup]="form" (ngSubmit)="submit()">
  <label>
    Email
    <input type="email" formControlName="email" />
  </label>

  @if (email.touched && email.hasError('required')) {
    <p class="error">Email is required.</p>
  }
  @if (email.touched && email.hasError('email')) {
    <p class="error">Enter a valid email address.</p>
  }

  <label>
    Password
    <input type="password" formControlName="password" />
  </label>

  <button type="submit" [disabled]="form.invalid">Create account</button>
</form>`,
        },
        {
          type: 'h3',
          text: 'Watching changes',
        },
        {
          type: 'code',
          lang: 'ts',
          code: `// Stream of values (takeUntilDestroyed must run in an injection context)
this.form.controls.plan.valueChanges
  .pipe(takeUntilDestroyed())
  .subscribe(plan => this.plan.set(plan));

// One-off read
const email = this.form.controls.email.value;

// Update part of the form
this.form.patchValue({ email: 'ada@example.com' });

// Replace all values
this.form.setValue({ email: 'a@b.com', password: 'secret123', plan: 'pro' });`,
        },
        {
          type: 'h3',
          text: 'Custom validators',
        },
        {
          type: 'code',
          lang: 'ts',
          code: `import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const noSpaces: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const value = control.value;
  return typeof value === 'string' && value.includes(' ')
    ? { noSpaces: true }
    : null;
};

// Use it like a built-in:
// username: ['', [Validators.required, noSpaces]]`,
        },
        {
          type: 'p',
          text: 'A validator returns `null` when valid, or an error object whose key can be checked with `hasError("noSpaces")`. Async validators return an Observable or Promise and are passed as the third control argument.',
        },
        {
          type: 'h3',
          text: 'Template-driven, for comparison',
        },
        {
          type: 'code',
          lang: 'html',
          code: `<form #form="ngForm" (ngSubmit)="submit(form.value)">
  <input name="email" [(ngModel)]="model.email" required email />
  <input name="password" type="password" [(ngModel)]="model.password" minlength="8" />
  <button [disabled]="form.invalid">Create account</button>
</form>`,
        },
        {
          type: 'p',
          text: 'Template-driven forms need `FormsModule`, a `name` on each control, and `[(ngModel)]`. They are fine for two fields; they become hard to test and reason about as rules grow. Do not mix `ngModel` with reactive form directives in the same form.',
        },
        {
          type: 'h3',
          text: 'Signal forms (Angular 21+, stable in 22)',
        },
        {
          type: 'code',
          lang: 'ts',
          code: `import { Component, signal } from '@angular/core';
import { email, form, FormField, required } from '@angular/forms/signals';

@Component({
  selector: 'app-signup',
  imports: [FormField],
  templateUrl: './signup.html',
})
export class Signup {
  readonly model = signal({ email: '', password: '' });

  readonly signup = form(this.model, (path) => {
    required(path.email, { message: 'Email is required' });
    email(path.email, { message: 'Enter a valid email' });
    required(path.password);
  });
}`,
        },
        {
          type: 'code',
          lang: 'html',
          code: `<form (submit)="submit($event)">
  <input type="email" [formField]="signup.email" />

  @if (signup.email().touched() && signup.email().invalid()) {
    @for (error of signup.email().errors(); track error) {
      <p class="error">{{ error.message }}</p>
    }
  }

  <button type="submit">Create account</button>
</form>`,
        },
        {
          type: 'callout',
          tone: 'interview',
          title: 'Reactive vs template-driven',
          text: '"Reactive forms keep the model in the component as typed FormControls, so validation and dynamic fields are testable and composable. Template-driven forms are simpler for small forms but put logic in the template. For anything non-trivial I reach for reactive forms."',
        },
        {
          type: 'callout',
          tone: 'warn',
          title: 'Zoneless note',
          text: 'In a zoneless app, reactive form model updates do not automatically schedule change detection. User input events still do. If async code updates the form and the UI must refresh, mirror the value into a signal or call markForCheck().',
        },
        {
          type: 'quiz',
          question:
            'Which validator setup is correct for a required, valid email in a reactive form?',
          options: [
            "['', Validators.required, Validators.email]",
            "['', [Validators.required, Validators.email]]",
            "['', { required: true, email: true }]",
            "['', 'required', 'email']",
          ],
          answer: 1,
          explain:
            'The second element of a FormControl definition is a validator or an array of validators. Use [Validators.required, Validators.email].',
        },
      ],
      takeaways: [
        'Reactive forms: typed FormGroup in the class, formControlName in the template.',
        'Template-driven: ngModel + name, good for tiny forms only.',
        'Signal forms: signal model + [formField] + schema validation (v21+).',
        'Mark controls touched before showing errors; disable submit while invalid.',
      ],
    },
    {
      id: 'lifecycle',
      title: 'Lifecycle and change detection',
      minutes: 45,
      summary:
        'What runs when, what replaced useEffect, and why a setTimeout callback no longer refreshes your view.',
      blocks: [
        {
          type: 'p',
          text: 'Angular components have lifecycle hooks. Signals and modern APIs have replaced some of them, but interviewers still expect the classic order.',
        },
        {
          type: 'table',
          headers: ['Hook', 'When it runs', 'React analogue'],
          rows: [
            ['ngOnChanges', 'Before ngOnInit, whenever an input reference changes', 'Render-time prop comparison'],
            ['ngOnInit', 'Once after the first input values are set', 'useEffect(..., []) (roughly)'],
            ['ngDoCheck', 'Every change detection run', 'No direct analogue; avoid'],
            ['ngAfterContentInit', 'After projected content is initialised', 'useLayoutEffect for children'],
            ['ngAfterViewInit', 'After the component view and children render', 'useLayoutEffect / ref callback'],
            ['ngOnDestroy', 'Just before the component is destroyed', 'useEffect cleanup'],
          ],
        },
        {
          type: 'code',
          lang: 'ts',
          title: 'Classic hooks',
          code: `import {
  Component, OnInit, AfterViewInit, OnDestroy, inject, ElementRef, viewChild
} from '@angular/core';

@Component({ selector: 'app-chart', templateUrl: './chart.html' })
export class Chart implements OnInit, AfterViewInit, OnDestroy {
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private chart?: ChartLibrary;

  ngOnInit() {
    // Fetch initial data, set up non-DOM state
  }

  ngAfterViewInit() {
    // The canvas exists now
    this.chart = new ChartLibrary(this.canvas().nativeElement);
  }

  ngOnDestroy() {
    this.chart?.destroy();
  }
}`,
        },
        {
          type: 'h3',
          text: 'Signal-era replacements',
        },
        {
          type: 'code',
          lang: 'ts',
          code: `import {
  Component, effect, signal, afterNextRender, viewChild, ElementRef, inject, DestroyRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export class ModernChart {
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly destroyRef = inject(DestroyRef);
  private readonly api = inject(DataApi);
  private readonly total = signal(0);

  constructor() {
    // Runs after the next render, browser-only
    afterNextRender(() => {
      const chart = new ChartLibrary(this.canvas().nativeElement);
      this.destroyRef.onDestroy(() => chart.destroy());
    });

    // React to a signal change with an external side effect
    effect(() => {
      document.title = 'Sales: ' + this.total();
    });

    // RxJS cleanup without OnDestroy
    this.api.updates$
      .pipe(takeUntilDestroyed())
      .subscribe(update => this.apply(update));
  }
}`,
        },
        {
          type: 'h3',
          text: 'Change detection, plainly',
        },
        {
          type: 'p',
          text: 'Historically, Zone.js patched browser APIs and told Angular "something async happened", so Angular checked the whole tree. Since Angular 21, new apps are **zoneless** by default. Angular now refreshes a view when a signal it reads changes, an event handler runs, an AsyncPipe emits, an input is set, or someone calls markForCheck().',
        },
        {
          type: 'p',
          text: 'Since Angular 22, **OnPush is the default** change detection strategy. A component is checked when one of those notifications marks it dirty. This is a performance win, but it means mutating a plain field in a setTimeout callback will not update the DOM.',
        },
        {
          type: 'code',
          lang: 'ts',
          title: 'What breaks under zoneless',
          code: `// BROKEN: no notification, view does not update
setTimeout(() => {
  this.count = 42;
}, 1000);

// WORKS: signal read in the template
readonly count = signal(0);
setTimeout(() => this.count.set(42), 1000);

// WORKS: manual notification
private readonly cdr = inject(ChangeDetectorRef);
setTimeout(() => {
  this.count = 42;
  this.cdr.markForCheck();
}, 1000);`,
        },
        {
          type: 'callout',
          tone: 'interview',
          title: 'The change detection answer',
          text: '"Angular no longer needs Zone.js. Signals notify Angular precisely which views depend on changed state, and OnPush means it only checks dirty components. Events, AsyncPipe, inputs, and markForCheck also schedule checks. That is more targeted than checking the whole tree."',
        },
        {
          type: 'callout',
          tone: 'warn',
          title: 'Do not put data fetching in ngAfterViewInit',
          text: 'Hooks are about lifecycle, not data. Fetch in a service/resource or ngOnInit. AfterViewInit is for DOM-dependent setup, and mutating bound state there can trigger ExpressionChangedAfterItHasBeenChecked in older change detection setups.',
        },
        {
          type: 'quiz',
          question:
            'In a zoneless Angular app, which update is guaranteed to refresh the template?',
          options: [
            'this.count = 42 in a setTimeout callback',
            'Pushing into an array stored in a signal and calling set with the same reference',
            'Calling a signal setter for a signal read in the template',
            'Assigning to a property of an object read in the template',
          ],
          answer: 2,
          explain:
            'Reading a signal in the template registers a dependency. Calling its setter notifies Angular and marks that view dirty. Plain field mutations and same-reference signal updates do not.',
        },
      ],
      takeaways: [
        'ngOnInit for setup; AfterViewInit for DOM; OnDestroy for cleanup.',
        'Signals replace some lifecycle plumbing: viewChild, effect, afterNextRender.',
        'Zoneless is default from v21; OnPush default from v22.',
        'Signals, events, AsyncPipe, inputs, and markForCheck trigger updates.',
      ],
    },
    {
      id: 'component-communication',
      title: 'Component communication patterns',
      minutes: 30,
      summary:
        'Parent/child, content projection, view queries, and sibling state — the four patterns interviewers ask about.',
      blocks: [
        {
          type: 'p',
          text: 'There are only four patterns. Pick the simplest one that fits the relationship.',
        },
        {
          type: 'table',
          headers: ['Relationship', 'Pattern'],
          rows: [
            ['Parent → child', 'input()'],
            ['Child → parent', 'output()'],
            ['Both directions', 'model()'],
            ['Parent renders markup into child', 'ng-content (content projection)'],
            ['Parent needs a child DOM node / API', 'viewChild()'],
            ['Siblings / distant components', 'Shared service with signals or a Subject'],
          ],
        },
        {
          type: 'code',
          lang: 'ts',
          title: 'Shared service for siblings',
          code: `@Injectable({ providedIn: 'root' })
export class FilterService {
  readonly query = signal('');
  readonly category = signal<'all' | 'books' | 'games'>('all');

  readonly filtered = computed(() => {
    const q = this.query().toLowerCase();
    return PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(q) &&
      (this.category() === 'all' || p.category === this.category())
    );
  });
}

// filter-bar.ts
readonly filters = inject(FilterService);
// template: <input [value]="filters.query()" (input)="filters.query.set(...)" />

// product-list.ts
readonly filters = inject(FilterService);
// template: @for (p of filters.filtered(); track p.id) { ... }`,
        },
        {
          type: 'code',
          lang: 'html',
          title: 'Content projection with slots',
          code: `<!-- panel.html -->
<section class="panel">
  <header><ng-content select="[panel-title]" /></header>
  <div class="panel-body"><ng-content /></div>
  <footer><ng-content select="[panel-actions]" /></footer>
</section>

<!-- usage -->
<app-panel>
  <h2 panel-title>Filters</h2>
  <app-filter-form />
  <button panel-actions (click)="reset()">Reset</button>
</app-panel>`,
        },
        {
          type: 'code',
          lang: 'ts',
          title: 'View queries',
          code: `import { Component, ElementRef, viewChild } from '@angular/core';

@Component({ selector: 'app-search', templateUrl: './search.html' })
export class Search {
  readonly input = viewChild.required<ElementRef<HTMLInputElement>>('input');

  focus() {
    this.input().nativeElement.focus();
  }
}`,
        },
        {
          type: 'code',
          lang: 'html',
          code: `<input #input type="search" />
<button (click)="focus()">Focus search</button>`,
        },
        {
          type: 'p',
          text: 'Use `viewChild` for elements or child components in your own template. Use `contentChild` for things projected into your component. Both have signal forms and legacy decorator forms (`@ViewChild`, `@ContentChild`).',
        },
        {
          type: 'callout',
          tone: 'interview',
          title: 'Do not reach for a service first',
          text: 'If a child needs to tell its parent something, use an output. If a parent needs to pass data down, use an input. A shared service is for state that genuinely outlives the relationship or is needed by unrelated components.',
        },
        {
          type: 'quiz',
          question:
            'A toolbar and a product list are siblings and both need the current search query. What is the cleanest Angular pattern?',
          options: [
            'Pass the query through the router',
            'Use a shared service with a signal',
            'Use viewChild from the toolbar to the list',
            'Emit an output from the list to the toolbar',
          ],
          answer: 1,
          explain:
            'Siblings have no direct parent/child binding. A root-provided service with a signal gives both components the same reactive state without prop drilling or DOM queries.',
        },
      ],
      takeaways: [
        'Inputs down, outputs up, model for both.',
        'ng-content projects markup; select creates named slots.',
        'viewChild accesses your template; contentChild accesses projected content.',
        'Shared services for siblings and app-wide state.',
      ],
    },
  ],
};
