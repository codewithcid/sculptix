# Contributing to Sculptix

Thanks for working on Sculptix. This guide keeps the codebase healthy as it grows.

## Setup

```bash
npm install
cp .env.example .env   # add your Supabase keys
npm start
```

## Quality gates (run before every PR)

```bash
npm run typecheck   # tsc --noEmit, must be clean
npm run lint        # eslint
npm test            # jest
```

CI ([.github/workflows/ci.yml](.github/workflows/ci.yml)) runs all three on every
push/PR to `main`.

## Architecture rules

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). The important invariants:

1. **Screens never call Supabase directly** — go through a `hook` → `service`.
2. **Services are the only place that knows snake_case DB rows** — map to
   camelCase domain models in `services/mappers.ts`.
3. **The engine (`src/engine`) stays pure** — no network, no AI, no React. It's
   deterministic and fully unit-tested; keep it that way so future smarter
   implementations can drop in behind the same `generateProgram` contract.
4. **Config is data** — new exercises/physiques/splits are edits under `src/data`,
   not new code paths.

## Testing

- Pure logic (engine, utils) is unit-tested under `__tests__/`. Add a test when
  you change programming logic, nutrition math, progression, or analytics.
- The engine is seeded/deterministic — assert on **invariants** (day counts,
  equipment validity, rep-range bounds) rather than brittle exact values.

```bash
npm test            # run once
npm run test:watch  # watch mode
```

## Adding an exercise

Add it to the right file in `src/data/exercises/` (e.g. `chest.ts`) with a unique
`id`, the muscles it works, the equipment tiers it's valid for, instructions,
common mistakes and alternative ids. The engine and library pick it up
automatically.

## Database changes

Add a new numbered migration in `supabase/migrations/` (never edit an applied
one). Mirror new enums/columns in `src/types/enums.ts` / `src/types/supabase.ts`,
and update the mappers.

## Commit / release

- Keep `app.json` `expo.version` meaningful; EAS auto-manages `versionCode`.
- JS-only fixes to test builds can ship via `eas update --branch preview`.
- Store builds: see [docs/DISTRIBUTE_APK.md](docs/DISTRIBUTE_APK.md) and
  [docs/PLAY_STORE_CHECKLIST.md](docs/PLAY_STORE_CHECKLIST.md).
