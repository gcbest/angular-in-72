import {
  Component,
  OnDestroy,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { GistSyncService } from '../../core/gist-sync.service';
import { ProgressService } from '../../core/progress.service';

@Component({
  selector: 'app-sync-dialog',
  templateUrl: './sync-dialog.html',
  styleUrl: './sync-dialog.css',
})
export class SyncDialog implements OnDestroy {
  readonly open = input(false);
  readonly closed = output<void>();

  readonly sync = inject(GistSyncService);
  private readonly progress = inject(ProgressService);

  readonly token = signal('');
  readonly gistId = signal('');
  readonly copied = signal(false);

  private copyTimer?: ReturnType<typeof setTimeout>;

  readonly configured = this.sync.configured;
  readonly autoSync = computed(() => this.sync.config().autoSync);
  readonly busy = computed(() => this.sync.status() === 'syncing');

  readonly completedCount = computed(() => this.progress.completed().size);
  readonly quizCount = computed(
    () => Object.keys(this.progress.quizAnswers()).length,
  );
  readonly knownCount = computed(() => this.progress.knownCards().size);

  constructor() {
    effect(() => {
      if (this.open()) {
        this.gistId.set(this.sync.config().gistId);
        this.token.set('');
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });
  }

  connect(event: Event): void {
    event.preventDefault();
    void this.sync.connect(this.token(), this.gistId());
  }

  createNew(): void {
    void this.sync.createNewGist(this.token());
  }

  syncNow(): void {
    void this.sync.sync();
  }

  pushLocal(): void {
    void this.sync.push();
  }

  pullRemote(): void {
    void this.sync.pull();
  }

  toggleAuto(checked: boolean): void {
    this.sync.setAutoSync(checked);
  }

  copyGistId(): void {
    const id = this.sync.config().gistId;
    if (!id || !navigator.clipboard) return;

    navigator.clipboard
      .writeText(id)
      .then(() => {
        this.copied.set(true);
        clearTimeout(this.copyTimer);
        this.copyTimer = setTimeout(() => this.copied.set(false), 1500);
      })
      .catch(() => {
        this.copied.set(false);
      });
  }

  disconnect(): void {
    this.sync.disconnect();
    this.gistId.set('');
    this.token.set('');
  }

  close(): void {
    this.closed.emit();
  }

  ngOnDestroy(): void {
    clearTimeout(this.copyTimer);
    document.body.style.overflow = '';
  }
}
