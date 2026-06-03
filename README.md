# 💪 Sculptix

A production-ready, **zero-paid-services** mobile app that helps users build their
dream physique through intelligent workout programming, nutrition tracking,
progress tracking and exercise guidance.

> **Not a calorie counter first.** It's a physique coach: pick a look, get a
> rule-based program tuned to your goal/equipment/time, train it, track it, and
> progress toward the physique you want.

Built with **React Native + Expo + TypeScript + NativeWind**, backed by the
**Supabase free tier**. No OpenAI / Anthropic / Gemini / AWS / Azure — the
"AI" coaching is a transparent, deterministic **rule-based engine** that you own
and can extend.

---

## ✨ Features

- **Onboarding** that captures your stats, experience, equipment, schedule and goal.
- **8 physique goal templates** (V-Taper, Men's Physique, Classic, Athletic, Lean
  Model, Powerbuilding, Strength, Fat Loss) with muscle priorities driving the program.
- **6 workout splits** (PPL, Upper/Lower, Arnold, Full Body, Bro, Custom) with
  automatic recommendation.
- **Rule-based workout generation engine** — sets, reps, rest and progression
  tailored to your inputs. Deterministic and unit-testable.
- **100+ exercise database** with instructions, common mistakes, muscles worked,
  alternatives and GIF support.
- **Workout Session Mode** — set logging, weight/reps, rest timer, auto-progress,
  resumable if interrupted.
- **Workout tracking** — history, personal records (est. 1RM), volume trends.
- **Manual nutrition tracking** — food search, custom foods, calorie + macro logging
  with personalised targets (Mifflin–St Jeor TDEE).
- **Body weight tracking** with trend charts (week / month / all).
- **Progress photos** (front/side/back) in private Supabase Storage with before/after compare.
- **Analytics dashboard** — frequency, volume, streaks, weight trend.
- **Dark / Light / System** themes, loading/empty/error states, smooth charts.

---

## 🧱 Tech Stack

| Layer            | Choice                                                            |
| ---------------- | ---------------------------------------------------------------- |
| Framework        | React Native + Expo (SDK 51)                                     |
| Language         | TypeScript (strict)                                              |
| Styling          | NativeWind (Tailwind CSS) with semantic design tokens           |
| Navigation       | React Navigation (native-stack + bottom-tabs)                   |
| Server state     | TanStack React Query                                             |
| Client state     | Zustand (persisted)                                              |
| Charts           | react-native-svg (lightweight custom charts, no Skia needed)    |
| Backend          | Supabase (Postgres, Auth, Storage, Row Level Security)          |
| Validation       | Zod                                                              |

Everything used is free / open-source or free-tier.

---

## 🚀 Quick start

### 1. Prerequisites

- Node 18+
- A free [Supabase](https://supabase.com) project
- [Expo Go](https://expo.dev/go) on your phone, or an emulator/simulator

### 2. Install

```bash
npm install
```

### 3. Set up the database

Use the SQL migrations in [`supabase/migrations`](./supabase/migrations).

**Option A — Supabase CLI (recommended)**

```bash
npm i -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push          # applies 0001/0002/0003 migrations
# seed some global foods:
psql "$DATABASE_URL" -f supabase/seed.sql   # or paste seed.sql in the SQL editor
```

**Option B — Dashboard SQL editor**

Open each file in order and run it:

1. `supabase/migrations/0001_init.sql` (tables, enums, triggers)
2. `supabase/migrations/0002_rls.sql` (Row Level Security)
3. `supabase/migrations/0003_storage.sql` (progress-photos bucket + policies)
4. `supabase/seed.sql` (optional global foods)

### 4. Configure environment

```bash
cp .env.example .env
```

Fill in from **Supabase → Project Settings → API**:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://YOUR-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR-anon-public-key
# optional: host exercise GIFs as <id>.gif under this base URL
EXPO_PUBLIC_EXERCISE_MEDIA_BASE=
```

> The anon key is **meant** to ship in the client. Your data is protected by
> Row Level Security, not by hiding the key.

### 5. Run

```bash
npm start          # then press i / a, or scan the QR with Expo Go
```

---

## 📦 Publishing to Google Play

Full step-by-step guide (build, store listing copy, Data Safety answers, content
rating) lives in **[docs/PLAY_STORE_CHECKLIST.md](./docs/PLAY_STORE_CHECKLIST.md)**.
In short:

1. Save your logo to `assets/source-logo.png`, then `npm run generate:assets` to
   produce the app icon, adaptive icon, splash, and the Play Console graphics.
2. Fill Supabase keys in [`eas.json`](./eas.json) (or as `eas secret`s).
3. Deploy the account-deletion function: `supabase functions deploy delete-account`
   (Google requires in-app account deletion — wired into Settings).
4. `eas build --platform android --profile production` → upload the `.aab`.
5. Host [docs/PRIVACY_POLICY.md](./docs/PRIVACY_POLICY.md) and link it in the listing.

---

## 🖼️ Exercise demonstration media

Exercise GIFs are resolved by [`getExerciseGifUrl`](./src/data/exercises/index.ts):

1. If an exercise has an explicit `gifUrl`, it's used.
2. Otherwise, if `EXPO_PUBLIC_EXERCISE_MEDIA_BASE` is set, the app loads
   `<base>/<exercise_id>.gif`.
3. If neither is set, a clean placeholder is shown.

To wire up real demos, host a set of GIFs named by exercise id (e.g.
`barbell_bench_press.gif`) — your own Supabase Storage bucket, a CDN, or the
public-domain `free-exercise-db` image set all work.

---

## 📂 Project structure

See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) for the full tour and the
extension points designed for future AI modules. Top level:

```
src/
  components/   Reusable UI + feature components (design system)
  config/       Env access
  data/         Exercise DB, physique templates, splits (JSON-style config)
  engine/       Rule-based workout + nutrition engine (pure, no network/AI)
  hooks/        React Query hooks
  lib/          Supabase client, React Query client
  navigation/   React Navigation stacks/tabs
  providers/    Auth context
  screens/      Screen components by feature
  services/     Supabase data access + mappers
  store/        Zustand stores (onboarding, live workout session)
  theme/        Color palettes + theme provider
  types/        Domain models, enums, generated DB types
  utils/        Dates, units, formatting, analytics
supabase/
  migrations/   SQL schema + RLS + storage
  seed.sql      Global foods
```

---

## 🧠 How the workout engine works

`generateProgram(input)` ([src/engine/generateProgram.ts](./src/engine/generateProgram.ts)) is a pure,
deterministic function:

1. Resolve the **physique template** → priority/deprioritized muscles + rep focus.
2. Resolve the **split** layout for the chosen weekly frequency.
3. Per day, **allocate exercise slots** across that day's muscles, weighting
   priority muscles higher.
4. **Select an exercise** per slot (equipment + experience aware, avoiding weekly
   repeats), compounds first.
5. **Prescribe** sets/reps/rest from the rep scheme (goal- and experience-adjusted).

It's seeded from the inputs, so the same answers always yield the same program —
reproducible and testable. Swapping in a future ML model means implementing the
same `generateProgram` contract.

---

## 🔒 Security

- Every user table has **Row Level Security**: `auth.uid() = user_id`.
- Progress photos live in a **private** bucket, namespaced by user id, served via
  short-lived signed URLs.
- Reference data (exercises, physique goals) is read-only.

---

## 📜 Scripts

```bash
npm start            # Expo dev server
npm run android      # open on Android
npm run ios          # open on iOS
npm run web          # run in the browser
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm test             # jest (engine + utils unit tests)
npm run generate:assets  # regenerate icons/splash/store graphics from assets/source-logo.png
npm run db:gen-types     # regenerate src/types/supabase.ts from your project
```

Quality gates run in CI on every push/PR — see
[.github/workflows/ci.yml](.github/workflows/ci.yml) and
[CONTRIBUTING.md](./CONTRIBUTING.md).

---

## 🗺️ Roadmap / extension points

The architecture leaves clean seams (interfaces, not implementations) for:

- AI Food Recognition · AI Physique Analysis · AI Form Checking
- Adaptive (auto-regulated) programming
- Subscriptions · Coach marketplace

None are implemented — see [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).

---

## License

MIT — yours to build on.
