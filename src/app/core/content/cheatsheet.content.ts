import { ApiItem, CheatSection } from '../content.models';

export const CHEAT_SECTIONS: CheatSection[] = [
  {
    id: 'components',
    title: 'Components & state',
    description: 'The core building blocks, side by side.',
    rows: [
      {
        topic: 'Define a component',
        react: `export function Card({ title }: { title: string }) {
  return <h2>{title}</h2>;
}`,
        angular: `@Component({
  selector: 'app-card',
  templateUrl: './card.html',
})
export class Card {
  title = input.required<string>();
}`,
        note: 'Angular separates the class from the template.',
      },
      {
        topic: 'Local state',
        react: `const [count, setCount] = useState(0);
setCount(c => c + 1);`,
        angular: `count = signal(0);
this.count.update(c => c + 1);`,
        note: 'Read a signal by calling it: count().',
      },
      {
        topic: 'Derived state',
        react: `const total = useMemo(
  () => items.reduce((s, i) => s + i.price, 0),
  [items]
);`,
        angular: `total = computed(() =>
  this.items().reduce((s, i) => s + i.price, 0)
);`,
        note: 'No dependency array; dependencies are tracked automatically.',
      },
      {
        topic: 'Side effect',
        react: `useEffect(() => {
  document.title = name;
}, [name]);`,
        angular: `effect(() => {
  document.title = this.name();
});`,
        note: 'Use effect() for external APIs, not for deriving state.',
      },
      {
        topic: 'Props / inputs',
        react: `<Card title={title} compact />`,
        angular: `<app-card [title]="title()" [compact]="true" />`,
      },
      {
        topic: 'Required input',
        react: `function Card({ title }: { title: string })`,
        angular: `title = input.required<string>();`,
      },
      {
        topic: 'Default input',
        react: `function Card({ compact = false })`,
        angular: `compact = input(false);`,
      },
      {
        topic: 'Callback prop / output',
        react: `<Card onSelect={handleSelect} />`,
        angular: `<app-card (select)="handleSelect($event)" />`,
      },
      {
        topic: 'Two-way value',
        react: `<Input value={value} onChange={setValue} />`,
        angular: `<app-input [(value)]="value" />`,
        note: 'The child declares value = model("").',
      },
      {
        topic: 'Children / slots',
        react: `<Card><h2>Title</h2><p>Body</p></Card>`,
        angular: `<app-card><h2 card-title>Title</h2><p>Body</p></app-card>`,
        note: 'Child template uses <ng-content select="[card-title]" />.',
      },
      {
        topic: 'Ref to an element',
        react: `const ref = useRef<HTMLInputElement>(null);
ref.current?.focus();`,
        angular: `input = viewChild.required<ElementRef>('input');
this.input().nativeElement.focus();`,
      },
      {
        topic: 'Shared state',
        react: `const ThemeContext = createContext('dark');
const theme = useContext(ThemeContext);`,
        angular: `// theme.service.ts
@Injectable({ providedIn: 'root' })
export class ThemeService {
  theme = signal<'dark' | 'light'>('dark');
}

// component
theme = inject(ThemeService).theme;`,
      },
      {
        topic: 'Scoped styles',
        react: `import styles from './card.module.css';
<div className={styles.card} />`,
        angular: `// card.css
.card { border: 1px solid; }

// styles are scoped by default`,
      },
    ],
  },
  {
    id: 'rendering',
    title: 'Rendering & events',
    description: 'Templates look different, but every expression has a direct equivalent.',
    rows: [
      {
        topic: 'Text',
        react: `<p>Hello {name}</p>`,
        angular: `<p>Hello {{ name() }}</p>`,
      },
      {
        topic: 'Conditional',
        react: `{loading ? <Spinner /> : <List />}`,
        angular: `@if (loading()) {
  <app-spinner />
} @else {
  <app-list />
}`,
      },
      {
        topic: 'List',
        react: `{items.map(item => (
  <Row key={item.id} item={item} />
))}`,
        angular: `@for (item of items(); track item.id) {
  <app-row [item]="item" />
}`,
        note: 'track is required. Use a stable id, not the index.',
      },
      {
        topic: 'Empty list',
        react: `{items.length === 0 && <Empty />}`,
        angular: `@for (item of items(); track item.id) {
  <app-row [item]="item" />
} @empty {
  <app-empty />
}`,
      },
      {
        topic: 'Conditional class',
        react: `<div className={active ? 'on' : ''} />`,
        angular: `<div [class.on]="active()" />`,
      },
      {
        topic: 'Inline style',
        react: `<div style={{ width: w, color }} />`,
        angular: `<div [style.width.px]="w()" [style.color]="color()" />`,
      },
      {
        topic: 'Click event',
        react: `<button onClick={() => save(id)}>`,
        angular: `<button (click)="save(id)">`,
      },
      {
        topic: 'Event payload',
        react: `onChange={e => setQuery(e.target.value)}`,
        angular: `(input)="query.set($any($event.target).value)"`,
      },
      {
        topic: 'Keyboard event',
        react: `onKeyDown={e => e.key === 'Enter' && submit()}`,
        angular: `(keyup.enter)="submit()"`,
      },
      {
        topic: 'Attribute',
        react: `<div aria-label={label} />`,
        angular: `<div [attr.aria-label]="label()" />`,
      },
      {
        topic: 'Fragment',
        react: `<><Header /><Main /></>`,
        angular: `<ng-container>
  <app-header />
  <app-main />
</ng-container>`,
      },
      {
        topic: 'Unsafe HTML',
        react: `<div dangerouslySetInnerHTML={{ __html: html }} />`,
        angular: `<div [innerHTML]="html"></div>`,
        note: 'Angular sanitises automatically; bypass only for trusted content.',
      },
      {
        topic: 'Template variable',
        react: `const total = items.length;`,
        angular: `@let total = items().length;`,
      },
    ],
  },
  {
    id: 'lifecycle',
    title: 'Lifecycle & effects',
    description: 'When code runs, and how to clean it up.',
    rows: [
      {
        topic: 'On mount',
        react: `useEffect(() => {
  load();
}, []);`,
        angular: `ngOnInit() {
  this.load();
}`,
      },
      {
        topic: 'On prop change',
        react: `useEffect(() => {
  sync(value);
}, [value]);`,
        angular: `effect(() => {
  this.sync(this.value());
});`,
        note: 'Or use a computed for derived values.',
      },
      {
        topic: 'After DOM paint',
        react: `useLayoutEffect(() => {
  measure();
}, []);`,
        angular: `afterNextRender(() => {
  this.measure();
});`,
      },
      {
        topic: 'Before unmount',
        react: `useEffect(() => {
  return () => socket.close();
}, []);`,
        angular: `ngOnDestroy() {
  this.socket.close();
}`,
      },
      {
        topic: 'Cleanup with DestroyRef',
        react: `useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
}, []);`,
        angular: `private destroyRef = inject(DestroyRef);

constructor() {
  const id = setInterval(tick, 1000);
  this.destroyRef.onDestroy(() => clearInterval(id));
}`,
      },
      {
        topic: 'Fetch on mount',
        react: `useEffect(() => {
  fetch('/api').then(r => r.json()).then(setData);
}, []);`,
        angular: `readonly data = toSignal(this.api.get(), {
  initialValue: [],
});`,
      },
    ],
  },
  {
    id: 'data',
    title: 'Async data',
    description: 'Fetching, cancellation, and state.',
    rows: [
      {
        topic: 'Fetch once',
        react: `const res = await fetch('/api/products');
const data = await res.json();`,
        angular: `this.http.get<Product[]>('/api/products');`,
        note: 'HttpClient returns a lazy Observable; subscribe or use AsyncPipe.',
      },
      {
        topic: 'Loading state',
        react: `const [loading, setLoading] = useState(false);`,
        angular: `loading = signal(false);`,
      },
      {
        topic: 'Error state',
        react: `const [error, setError] = useState<Error | null>(null);`,
        angular: `error = signal<unknown>(null);`,
      },
      {
        topic: 'Cancel on new search',
        react: `const controller = new AbortController();
fetch(url, { signal: controller.signal });
return () => controller.abort();`,
        angular: `terms.pipe(
  debounceTime(300),
  switchMap(term => this.api.search(term))
);`,
      },
      {
        topic: 'Retry',
        react: `// manual: call load() again from an error boundary/button`,
        angular: `this.http.get(url).pipe(retry(2));`,
      },
      {
        topic: 'Parallel requests',
        react: `const [user, orders] = await Promise.all([...]);`,
        angular: `forkJoin({
  user: this.api.getUser(id),
  orders: this.api.getOrders(id),
});`,
      },
      {
        topic: 'Polling',
        react: `useEffect(() => {
  const id = setInterval(load, 5000);
  return () => clearInterval(id);
}, []);`,
        angular: `interval(5000).pipe(
  switchMap(() => this.api.getStatus())
);`,
      },
      {
        topic: 'Unsubscribe',
        react: `return () => controller.abort();`,
        angular: `obs.pipe(takeUntilDestroyed());`,
        note: 'AsyncPipe and toSignal unsubscribe automatically.',
      },
    ],
  },
  {
    id: 'forms',
    title: 'Forms',
    description: 'Controlled inputs, validation, and submission.',
    rows: [
      {
        topic: 'Controlled input',
        react: `<input value={email} onChange={e => setEmail(e.target.value)} />`,
        angular: `<input [value]="email()" (input)="email.set($any($event.target).value)" />`,
      },
      {
        topic: 'Form model',
        react: `const [form, setForm] = useState({ email: '', password: '' });`,
        angular: `form = this.fb.nonNullable.group({
  email: ['', [Validators.required, Validators.email]],
  password: ['', Validators.required],
});`,
      },
      {
        topic: 'Bind a field',
        react: `<input value={form.email} onChange={...} />`,
        angular: `<input formControlName="email" />`,
        note: 'Wrap the form with [formGroup]="form".',
      },
      {
        topic: 'Read values',
        react: `const values = form;`,
        angular: `const values = this.form.getRawValue();`,
      },
      {
        topic: 'Validation',
        react: `if (!email.includes('@')) setError('Invalid');`,
        angular: `Validators.required, Validators.email, Validators.minLength(8)`,
      },
      {
        topic: 'Show errors',
        react: `{error && <p>{error}</p>}`,
        angular: `@if (email.touched && email.hasError('email')) {
  <p>Enter a valid email.</p>
}`,
      },
      {
        topic: 'Submit',
        react: `<form onSubmit={e => { e.preventDefault(); save(); }}>`,
        angular: `<form [formGroup]="form" (ngSubmit)="save()">`,
      },
      {
        topic: 'Signal form (v21+)',
        react: `// controlled state + validation schema`,
        angular: `model = signal({ email: '' });
form = form(this.model, path => required(path.email));

// <input [formField]="form.email" />`,
      },
    ],
  },
  {
    id: 'routing',
    title: 'Routing',
    description: 'URLs, params, lazy loading, and guards.',
    rows: [
      {
        topic: 'Declare routes',
        react: `<Route path="/products" element={<Products />} />`,
        angular: `{ path: 'products', component: ProductsPage }`,
      },
      {
        topic: 'Link',
        react: `<Link to="/products">Products</Link>`,
        angular: `<a routerLink="/products">Products</a>`,
      },
      {
        topic: 'Active link',
        react: `<NavLink className={({ isActive }) => isActive ? 'on' : ''} />`,
        angular: `<a routerLink="/products" routerLinkActive="on">Products</a>`,
      },
      {
        topic: 'Outlet',
        react: `<Outlet />`,
        angular: `<router-outlet />`,
      },
      {
        topic: 'Route param',
        react: `const { id } = useParams();`,
        angular: `id = input.required({ transform: numberAttribute });`,
        note: 'Requires withComponentInputBinding().',
      },
      {
        topic: 'Query param',
        react: `const [params] = useSearchParams();`,
        angular: `// withComponentInputBinding: query = input('')`,
      },
      {
        topic: 'Navigate in code',
        react: `navigate('/products/' + id);`,
        angular: `this.router.navigate(['/products', id]);`,
      },
      {
        topic: 'Lazy route',
        react: `const Products = lazy(() => import('./Products'));`,
        angular: `{
  path: 'products',
  loadComponent: () =>
    import('./products').then(m => m.ProductsPage),
}`,
      },
      {
        topic: 'Protect a route',
        react: `<ProtectedRoute><Admin /></ProtectedRoute>`,
        angular: `{ path: 'admin', canActivate: [authGuard], component: Admin }`,
      },
      {
        topic: 'Preload data',
        react: `// loader / TanStack Query`,
        angular: `{ path: 'product/:id', resolve: { product: productResolver } }`,
      },
    ],
  },
  {
    id: 'testing',
    title: 'Testing',
    description: 'Render, query, interact, assert.',
    rows: [
      {
        topic: 'Render',
        react: `render(<Counter />);`,
        angular: `const fixture = TestBed.createComponent(Counter);
await fixture.whenStable();`,
      },
      {
        topic: 'Set props',
        react: `render(<Card title="Hi" />);`,
        angular: `fixture.componentRef.setInput('title', 'Hi');`,
      },
      {
        topic: 'Query DOM',
        react: `screen.getByRole('button', { name: /save/i });`,
        angular: `fixture.nativeElement.querySelector('button');`,
      },
      {
        topic: 'Click',
        react: `await user.click(screen.getByRole('button'));`,
        angular: `button.click();
await fixture.whenStable();`,
      },
      {
        topic: 'Mock a service',
        react: `vi.mock('./api');`,
        angular: `providers: [{ provide: Api, useValue: stub }]`,
      },
      {
        topic: 'Mock HTTP',
        react: `msw / fetch mock`,
        angular: `provideHttpClientTesting();
http.expectOne('/api').flush(data);`,
      },
    ],
  },
];

export const API_ITEMS: ApiItem[] = [
  { name: 'signal', kind: 'function', description: 'Creates writable reactive state. Read with ().' },
  { name: 'computed', kind: 'function', description: 'Lazy, memoised derived signal.' },
  { name: 'effect', kind: 'function', description: 'Runs a side effect when dependencies change.' },
  { name: 'linkedSignal', kind: 'function', description: 'Writable signal derived from another, with overrides.' },
  { name: 'resource', kind: 'function', description: 'Signal-based async data with loading/error/reload.' },
  { name: 'input', kind: 'function', description: 'Signal input; .required() for mandatory props.' },
  { name: 'output', kind: 'function', description: 'Signal-based event emitter.' },
  { name: 'model', kind: 'function', description: 'Writable input that enables [(value)] binding.' },
  { name: 'viewChild', kind: 'function', description: 'Signal query for an element/component in the view.' },
  { name: 'contentChild', kind: 'function', description: 'Signal query for projected content.' },
  { name: 'inject', kind: 'function', description: 'Resolves a dependency from the injector.' },
  { name: 'Injectable', kind: 'decorator', description: 'Marks a class as available to DI; supports providers.' },
  { name: 'Service', kind: 'decorator', description: 'Angular 22 shorthand for a root-provided service.' },
  { name: 'Component', kind: 'decorator', description: 'Defines selector, template, styles, and imports.' },
  { name: 'Directive', kind: 'decorator', description: 'Attaches behaviour to an existing element.' },
  { name: 'Pipe', kind: 'decorator', description: 'Declares a template value transformer.' },
  { name: 'provideRouter', kind: 'function', description: 'Registers the router and its features.' },
  { name: 'provideHttpClient', kind: 'function', description: 'Registers HttpClient, fetch, and interceptors.' },
  { name: 'HttpClient', kind: 'class', description: 'Typed HTTP client returning Observables.' },
  { name: 'Router', kind: 'class', description: 'Programmatic navigation and URL access.' },
  { name: 'ActivatedRoute', kind: 'class', description: 'Current route params, query params, and data.' },
  { name: 'FormBuilder', kind: 'class', description: 'Shorthand for creating typed reactive forms.' },
  { name: 'Validators', kind: 'class', description: 'Built-in sync validators (required, email, minLength).' },
  { name: 'DestroyRef', kind: 'class', description: 'Registers cleanup callbacks on destroy.' },
  { name: 'ChangeDetectorRef', kind: 'class', description: 'markForCheck / detectChanges for manual control.' },
  { name: 'toSignal', kind: 'function', description: 'Converts an Observable to a signal and unsubscribes.' },
  { name: 'toObservable', kind: 'function', description: 'Converts a signal to an Observable stream.' },
  { name: 'takeUntilDestroyed', kind: 'operator', description: 'Completes a subscription when the context is destroyed.' },
  { name: 'AsyncPipe', kind: 'pipe', description: 'Subscribes to an Observable/Promise in the template.' },
  { name: 'NgOptimizedImage', kind: 'directive', description: 'Responsive, priority-aware image loading.' },
];

export const CLI_COMMANDS = [
  { command: 'ng new my-app', description: 'Scaffold an app with routing and styles.' },
  { command: 'ng serve --open', description: 'Run the dev server with HMR.' },
  { command: 'ng generate component product-card', description: 'Create a component and its files.' },
  { command: 'ng generate service cart', description: 'Create an injectable service.' },
  { command: 'ng generate pipe initials', description: 'Create a pipe.' },
  { command: 'ng generate guard auth', description: 'Create a functional route guard.' },
  { command: 'ng build', description: 'Production build with AOT and hashing.' },
  { command: 'ng test', description: 'Run the unit test suite.' },
];

export const LIFECYCLE_ROWS = [
  { hook: 'ngOnChanges', when: 'Before ngOnInit and whenever an input reference changes.', react: 'Prop comparison during render' },
  { hook: 'ngOnInit', when: 'Once after the first input values are set.', react: 'useEffect(..., [])' },
  { hook: 'ngDoCheck', when: 'Every change detection run. Avoid unless necessary.', react: 'No direct analogue' },
  { hook: 'ngAfterContentInit', when: 'After projected content initialises.', react: 'Layout effect for children' },
  { hook: 'ngAfterViewInit', when: 'After the view and child views render.', react: 'useLayoutEffect / ref callback' },
  { hook: 'ngOnDestroy', when: 'Just before the component is destroyed.', react: 'useEffect cleanup' },
];

export const RXJS_OPERATORS = [
  { name: 'map', use: 'Transform each value.' },
  { name: 'filter', use: 'Keep values matching a predicate.' },
  { name: 'tap', use: 'Side effect without changing the value.' },
  { name: 'switchMap', use: 'Latest-wins; cancels the previous inner observable.' },
  { name: 'mergeMap', use: 'Run inner observables concurrently.' },
  { name: 'concatMap', use: 'Queue inner observables in order.' },
  { name: 'exhaustMap', use: 'Ignore new values while an inner observable is active.' },
  { name: 'catchError', use: 'Recover from an error with a fallback observable.' },
  { name: 'retry', use: 'Resubscribe a number of times on error.' },
  { name: 'debounceTime', use: 'Wait for a pause in emissions.' },
  { name: 'distinctUntilChanged', use: 'Skip consecutive duplicates.' },
  { name: 'combineLatest', use: 'Combine the latest value from each stream.' },
  { name: 'forkJoin', use: 'Wait for all to complete, emit once.' },
  { name: 'takeUntilDestroyed', use: 'Unsubscribe when the injection context is destroyed.' },
  { name: 'finalize', use: 'Run cleanup on completion, error, or unsubscribe.' },
];
