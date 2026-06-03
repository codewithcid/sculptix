# Architecture

This document explains how the codebase is organised, the data flow, and the
**extension points** designed for future modules (AI features, subscriptions,
marketplace). The guiding principle: **keep the rule-based engine and data
access pure and swappable**, so smarter implementations can drop in behind the
same contracts.

## Layered overview

```
            ┌─────────────────────────────────────────────┐
   UI       │  screens/ + components/ (NativeWind, themed) │
            └───────────────┬─────────────────────────────┘
                            │ hooks (React Query)
            ┌───────────────▼─────────────────────────────┐
  State     │  hooks/  ·  store/ (Zustand)  ·  providers/  │
            └───────────────┬─────────────────────────────┘
                            │ services (typed)
            ┌───────────────▼─────────────────────────────┐
  Domain    │  engine/ (pure rules)  ·  data/ (config)     │
            └───────────────┬─────────────────────────────┘
                            │ supabase-js
            ┌───────────────▼─────────────────────────────┐
  Backend   │  Supabase: Postgres + Auth + Storage + RLS   │
            └─────────────────────────────────────────────┘
```

- **screens / components** never touch Supabase directly — they call hooks.
- **hooks** wrap **services** with React Query (cache, invalidation, mutations).
- **services** are the only place that knows about Supabase and snake_case rows;
  they map to/from camelCase domain models (`services/mappers.ts`).
- **engine** and **data** are pure and dependency-free (no network, no AI) — they
  power generation and are trivially unit-testable.

## Directory responsibilities

| Path                | Responsibility |
| ------------------- | -------------- |
| `src/types`         | Enums (mirroring Postgres enums), domain models, hand-maintained `Database` type for the typed client. |
| `src/data`          | Static config: 100+ exercises (`exercises/`), 8 physique templates, 6 splits. JSON-style, the offline source of truth. |
| `src/engine`        | `generateProgram`, `recommendSplit`, progression math, nutrition targets. Seeded + deterministic. |
| `src/services`      | Supabase CRUD per domain + row↔model mappers. Throw readable errors. |
| `src/hooks`         | React Query hooks; the only thing screens import for data. |
| `src/store`         | Zustand: `onboardingStore` (persisted draft), `workoutSessionStore` (persisted live session). |
| `src/lib`           | `supabase` client, `queryClient` + central query keys. |
| `src/providers`     | `AuthProvider` (session + token refresh). |
| `src/theme`         | Palettes + `ThemeProvider`, bridges saved preference → NativeWind. |
| `src/components`    | Design system (`ui/`) + feature components (charts, exercise, rest timer, macros). |
| `src/screens`       | Feature-grouped screens (auth, onboarding, home, workout, nutrition, progress, profile). |
| `src/navigation`    | Root decision tree (auth → onboarding → app) + tab/stack navigators. |
| `supabase`          | SQL migrations, RLS, storage policies, seed. |

## Key data flows

### Onboarding → program

1. `onboardingStore` collects answers (persisted, resumable).
2. On finish, `useCompleteOnboarding` upserts the profile (`onboarding_completed = true`).
3. `useGenerateProgram` runs `engine.generateProgram(input)` then
   `programService.saveProgram` (deactivates old, inserts program + normalized
   `program_days`, snapshots the full structure in `generated_config`).
4. `RootNavigator` observes the profile and switches to the app.

### Workout session

1. `ActiveWorkoutScreen` seeds `workoutSessionStore` from a `ProgramDay` and
   creates a `workouts` row (`startWorkout`).
2. Every set edit mutates the persisted session (survives app kill).
3. `finishWorkout` writes `workout_set_logs`, computes volume, marks complete and
   refreshes `personal_records` (best est-1RM / max weight).

### Nutrition

- Foods are searched from a shared table (global rows have `user_id = NULL`).
- Logging **snapshots** the computed macros onto `nutrition_logs` so edits to a
  food never rewrite history.
- Targets come from `engine.calcMacroTargets` (Mifflin–St Jeor → TDEE → goal).

## Extension points (designed, not implemented)

These are intentional seams. None ship today.

| Future module            | Seam to implement |
| ------------------------ | ----------------- |
| **AI Adaptive Programming** | Provide an alternate `generateProgram(input): WorkoutProgram`. The contract already returns a full program; gate it behind a feature flag and call the same `saveProgram`. Per-set performance is already persisted for autoregulation. |
| **AI Food Recognition**     | Add a `foodRecognition` service returning `CustomFoodInput`/`Food`; feed its result into the existing `logFood` flow. The food + logging schema is unchanged. |
| **AI Physique Analysis**    | Operate on `progress_photos`; add an `analysis` table keyed by `photo id`. Photos already carry pose + date + signed URLs. |
| **AI Form Checking**        | Attach to `ExercisePlayer` / session video capture; exercises already model `commonMistakes` to compare against. |
| **Subscriptions**           | Add a `subscriptions` table + an `entitlements` hook; gate features in hooks, not screens. |
| **Coach Marketplace**       | New `coaches` / `coach_clients` tables with RLS; programs already belong to a `user_id` and could be authored by a coach id. |

### Why this stays clean

- The **engine contract is a single pure function** — easy to A/B or replace.
- **Services are the only Supabase boundary** — new tables don't leak into the UI.
- **Hooks are the only data surface for screens** — feature gating happens in one layer.
- **Config is data, not code** — new physiques/splits/exercises are JSON-style edits.

## Testing notes

The engine is pure and seeded, so it's ideal for unit tests:

```ts
import { generateProgram } from '@/engine';

const program = generateProgram({
  physiqueGoalId: 'v_taper',
  splitType: 'ppl',
  daysPerWeek: 4,
  sessionDurationMin: 60,
  experience: 'intermediate',
  equipment: 'full_gym',
  primaryGoal: 'build_muscle',
});
// Same input → same program every time.
expect(program.days).toHaveLength(4);
```
