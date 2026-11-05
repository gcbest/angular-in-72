# Angular in 72 Hours

A three-day Angular curriculum for React developers preparing for a Karat interview. The site itself is built with Angular 22, so you can read the source as a working reference while you study.

**Live site:** https://gcbest.github.io/angular-in-72/  
**Repo:** https://github.com/gcbest/angular-in-72

The live site is deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`.

## Run it

```bash
npm install
npm start
```

Open http://localhost:4200.

```bash
npm run build       # production build
npm run typecheck   # TypeScript check
```

## What is inside

- **22 lessons across three days**, each with code, gotchas, interview notes, and a quiz.
- **React → Angular cheat sheet** with 64 side-by-side mappings, an API glossary, lifecycle table, RxJS operators, and CLI commands.
- **53 flashcards** with category filters and a "known" counter.
- **A timed 12-question drill** with a 12-minute clock, instant feedback, scoring, and a full review.
- **Progress tracking** in `localStorage` — lesson completion, quiz answers, flashcard progress, and best drill score persist across reloads.
- **Optional GitHub gist sync** — connect a secret gist with a personal access token to carry progress between your laptop and phone.
- **Global search** with `Cmd/Ctrl + K`, dark/light themes, and a mobile layout.

## The plan

| Day | Focus | Time |
| --- | --- | --- |
| 01 | Mental model, project anatomy, components, bindings, control flow, signals, inputs/outputs, pipes | 4–5 h |
| 02 | Services & DI, RxJS, HTTP, routing, forms, lifecycle/change detection, component communication | 5–6 h |
| 03 | Performance, testing, live-coding playbook, React-background answers, rapid-fire Q&A, mock interview | 4–5 h |

If you only have six hours, use the **"20% that gets asked"** section on the dashboard: signals, DI, RxJS, routing, forms, and the live-coding playbook.

## How to study

1. **Read for the shape** — 20 minutes per lesson. Do not memorise syntax.
2. **Close the tab and say it** — answer the quiz, then explain the idea out loud.
3. **Build the search page** — on day three, recreate the product search feature from a blank file. It covers signals, HTTP, RxJS, routing, forms, and state.

## Project structure

```
src/app/
  app.ts / app.html / app.css        # shell: sidebar, topbar, search, theme
  app.config.ts / app.routes.ts      # router, lazy routes
  core/
    content.models.ts                # content types
    content/                         # the curriculum (day1, day2, day3, cheatsheet, drills)
    progress.service.ts              # localStorage progress
    theme.service.ts                 # dark/light
    search-index.ts                  # search corpus
  shared/
    code-block/                      # syntax highlighting + copy
    quiz/                            # persisted multiple-choice
    lesson-view/                     # renders all content block types
    search-overlay/                  # Cmd+K palette
    cheat-row/                       # React/Angular panes
  pages/
    home/ day/ cheatsheet/ drills/
```

## Version notes

- Angular **22.2**, standalone components, signals, zoneless change detection, and OnPush by default.
- The content also flags the legacy forms you may meet in an older interview codebase: NgModules, `*ngIf` / `*ngFor`, constructor injection, decorator inputs/outputs, and Zone.js.
- The three form approaches are covered: template-driven, reactive, and signal forms (Angular 21+).

## Sync between devices

Progress is local by default. To sync it through a **secret GitHub gist**:

1. Open **Sync progress** in the sidebar.
2. Create a token with the `gist` scope at
   [github.com/settings/tokens](https://github.com/settings/tokens/new?scopes=gist&description=Angular%20in%2072%20progress%20sync).
   A fine-grained token with **Gists: read and write** also works.
3. Paste the token and leave the gist id blank. The app creates the secret gist and saves its id.
4. On your phone, open the same site, paste the **same token and gist id**, and sync.

`Sync now` pulls remote, merges, then pushes. Completion, flashcards, and the best score are unioned, so neither device loses progress. Quiz answers are locked after the first attempt; on a conflict the device performing the merge keeps its own answer.

The token is stored only in the browser's `localStorage` and sent directly to `api.github.com`. It is never committed to the repo. Use a token with only gist access and an expiry date. A secret gist is unlisted, not private — do not put sensitive data in it.

## Progress and reset

Progress is stored under `ng72.progress.v1` in `localStorage` and includes lessons, quiz answers, known flashcards, and the best drill score. Use **Reset progress** in the sidebar to clear it. Gist connection settings use `ng72.gist.v1`.
