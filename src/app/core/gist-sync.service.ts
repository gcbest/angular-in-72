import {
  Injectable,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { ProgressService, ProgressState } from './progress.service';

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export interface GistConfig {
  token: string;
  gistId: string;
  autoSync: boolean;
  lastSyncedAt: string | null;
}

interface GistPayload {
  version: 1;
  app: 'angular-in-72';
  savedAt: string;
  progress: ProgressState;
}

interface GistResponse {
  id: string;
  html_url: string;
  files: Record<string, { content?: string; truncated?: boolean }>;
}

const CONFIG_KEY = 'ng72.gist.v1';
const FILE_NAME = 'angular-in-72-progress.json';
const API = 'https://api.github.com';

const EMPTY_CONFIG: GistConfig = {
  token: '',
  gistId: '',
  autoSync: true,
  lastSyncedAt: null,
};

@Injectable({ providedIn: 'root' })
export class GistSyncService {
  private readonly progress = inject(ProgressService);

  private readonly configState = signal<GistConfig>(this.loadConfig());

  readonly config = this.configState.asReadonly();
  readonly status = signal<SyncStatus>('idle');
  readonly error = signal<string | null>(null);

  readonly configured = computed(() => {
    const config = this.configState();
    return config.token.length > 0 && config.gistId.length > 0;
  });

  readonly gistUrl = computed(() => {
    const id = this.configState().gistId;
    return id ? 'https://gist.github.com/' + id : null;
  });

  readonly lastSyncedAt = computed(() => this.configState().lastSyncedAt);

  private busy = false;
  private pendingPush = false;
  private pushTimer?: ReturnType<typeof setTimeout>;
  private lastAutoTick = 0;

  constructor() {
    if (this.configured() && this.configState().autoSync) {
      setTimeout(() => void this.sync(), 700);
    }

    effect(() => {
      const tick = this.progress.changeTick();
      const config = this.configState();

      if (tick === 0 || tick === this.lastAutoTick) return;
      if (!config.autoSync || !config.token || !config.gistId) return;

      this.lastAutoTick = tick;
      untracked(() => this.schedulePush());
    });
  }

  /**
   * Connect to a gist. If no gist id is supplied, a new secret gist is created.
   * A token can be omitted when one is already saved.
   */
  async connect(token: string, gistId: string): Promise<boolean> {
    const nextToken = token.trim();
    const nextGistId = gistId.trim();

    if (nextToken) this.saveConfig({ token: nextToken });
    if (nextGistId) this.saveConfig({ gistId: nextGistId });

    if (!this.configState().token) {
      this.fail('Add a GitHub token first.');
      return false;
    }

    this.saveConfig({ autoSync: true });

    if (!this.configState().gistId) {
      return this.createGist();
    }

    return this.sync();
  }

  async createGist(): Promise<boolean> {
    if (!this.configState().token) {
      this.fail('Add a GitHub token first.');
      return false;
    }

    return this.withStatus(async () => {
      const res = await this.api('/gists', {
        method: 'POST',
        body: JSON.stringify({
          description: 'Angular in 72 — study progress',
          public: false,
          files: {
            [FILE_NAME]: { content: JSON.stringify(this.payload(), null, 2) },
          },
        }),
      });

      const gist = (await res.json()) as GistResponse;
      this.saveConfig({
        gistId: gist.id,
        autoSync: true,
        lastSyncedAt: new Date().toISOString(),
      });
    });
  }

  /** Save a new token (if provided) and create a fresh gist. */
  async createNewGist(token: string): Promise<boolean> {
    if (token.trim()) {
      this.saveConfig({ token: token.trim(), gistId: '' });
    }
    return this.createGist();
  }

  /** Pull remote, merge, then push the merged snapshot. */
  async sync(): Promise<boolean> {
    if (!this.configured()) {
      this.fail('Add a token and gist first.');
      return false;
    }

    return this.withStatus(async () => {
      const remote = await this.fetchRemote();
      if (remote) this.progress.mergeRemote(remote);
      await this.patchGist();
      this.touchSynced();
    });
  }

  async pull(): Promise<boolean> {
    if (!this.configured()) {
      this.fail('Add a token and gist first.');
      return false;
    }

    return this.withStatus(async () => {
      const remote = await this.fetchRemote();
      if (remote) this.progress.mergeRemote(remote);
      this.touchSynced();
    });
  }

  async push(): Promise<boolean> {
    if (!this.configured()) {
      this.fail('Add a token and gist first.');
      return false;
    }

    if (this.busy) {
      this.pendingPush = true;
      return false;
    }

    return this.withStatus(async () => {
      await this.patchGist();
      this.touchSynced();
    });
  }

  setAutoSync(enabled: boolean): void {
    this.saveConfig({ autoSync: enabled });
  }

  disconnect(): void {
    if (this.pushTimer) {
      clearTimeout(this.pushTimer);
      this.pushTimer = undefined;
    }
    this.pendingPush = false;
    this.configState.set({ ...EMPTY_CONFIG });
    this.persistConfig(this.configState());
    this.status.set('idle');
    this.error.set(null);
  }

  /** Format the last sync time for the settings dialog. */
  lastSyncLabel(): string {
    const iso = this.lastSyncedAt();
    if (!iso) return 'Never synced';

    const diff = Date.now() - new Date(iso).getTime();
    if (diff < 60_000) return 'Synced just now';
    if (diff < 3_600_000) {
      const minutes = Math.floor(diff / 60_000);
      return 'Synced ' + minutes + ' min ago';
    }
    if (diff < 86_400_000) {
      const hours = Math.floor(diff / 3_600_000);
      return 'Synced ' + hours + ' h ago';
    }
    return 'Synced ' + new Date(iso).toLocaleDateString();
  }

  private schedulePush(): void {
    if (this.pushTimer) clearTimeout(this.pushTimer);
    this.pushTimer = setTimeout(() => {
      this.pushTimer = undefined;
      void this.push();
    }, 1200);
  }

  private async withStatus(fn: () => Promise<void>): Promise<boolean> {
    if (this.busy) {
      this.pendingPush = true;
      return false;
    }

    this.busy = true;
    this.status.set('syncing');
    this.error.set(null);

    try {
      await fn();
      this.status.set('success');
      return true;
    } catch (error) {
      this.fail(error instanceof Error ? error.message : 'Sync failed.');
      return false;
    } finally {
      this.busy = false;
      if (this.pendingPush && this.status() !== 'error') {
        this.pendingPush = false;
        this.schedulePush();
      }
    }
  }

  private async fetchRemote(): Promise<ProgressState | null> {
    const res = await this.api('/gists/' + this.configState().gistId);
    const gist = (await res.json()) as GistResponse;
    const file = gist.files?.[FILE_NAME];

    if (!file?.content) {
      throw new Error('This gist does not contain ' + FILE_NAME + '.');
    }

    const parsed = JSON.parse(file.content) as Partial<GistPayload>;
    if (!parsed.progress) {
      throw new Error('This gist is not an Angular in 72 progress file.');
    }

    return parsed.progress;
  }

  private async patchGist(): Promise<void> {
    await this.api('/gists/' + this.configState().gistId, {
      method: 'PATCH',
      body: JSON.stringify({
        files: {
          [FILE_NAME]: { content: JSON.stringify(this.payload(), null, 2) },
        },
      }),
    });
  }

  private payload(): GistPayload {
    return {
      version: 1,
      app: 'angular-in-72',
      savedAt: new Date().toISOString(),
      progress: this.progress.snapshot(),
    };
  }

  private async api(path: string, init: RequestInit = {}): Promise<Response> {
    const token = this.configState().token;
    if (!token) throw new Error('Add a GitHub token first.');

    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      Authorization: 'Bearer ' + token,
      'X-GitHub-Api-Version': '2022-11-28',
    };
    if (init.body) headers['Content-Type'] = 'application/json';

    const res = await fetch(API + path, { ...init, headers });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error(
          'GitHub rejected the token. Check that it has gist access and has not expired.',
        );
      }
      if (res.status === 404) {
        throw new Error(
          'Gist not found. Check the gist id, or create a new gist.',
        );
      }
      if (res.status === 403) {
        throw new Error('GitHub denied the request or the rate limit was hit.');
      }
      if (res.status === 422) {
        throw new Error('GitHub could not save this gist. Check the token scope.');
      }
      throw new Error('GitHub API error ' + res.status + '.');
    }

    return res;
  }

  private touchSynced(): void {
    this.saveConfig({ lastSyncedAt: new Date().toISOString() });
  }

  private fail(message: string): void {
    this.error.set(message);
    this.status.set('error');
  }

  private saveConfig(patch: Partial<GistConfig>): void {
    this.configState.update((config) => ({ ...config, ...patch }));
    this.persistConfig(this.configState());
  }

  private loadConfig(): GistConfig {
    if (typeof localStorage === 'undefined') return { ...EMPTY_CONFIG };
    try {
      const raw = localStorage.getItem(CONFIG_KEY);
      if (!raw) return { ...EMPTY_CONFIG };
      const parsed = JSON.parse(raw) as Partial<GistConfig>;
      return {
        token: typeof parsed.token === 'string' ? parsed.token : '',
        gistId: typeof parsed.gistId === 'string' ? parsed.gistId : '',
        autoSync: parsed.autoSync !== false,
        lastSyncedAt:
          typeof parsed.lastSyncedAt === 'string' ? parsed.lastSyncedAt : null,
      };
    } catch {
      return { ...EMPTY_CONFIG };
    }
  }

  private persistConfig(config: GistConfig): void {
    try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    } catch {
      // Token persistence is best-effort; the user can paste it again.
    }
  }
}
