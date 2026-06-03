# Sculptix — Google Play submission checklist

A step-by-step, policy-compliant path from this repo to a published app.

---

## 0. Accounts & tooling

- [ ] Google Play Developer account created ($25 one-time) — approval can take 1–2 days.
- [ ] `npm i -g eas-cli`
- [ ] `eas login` (free Expo account)

## 1. Brand assets

- [ ] Save the Sculptix logo (square PNG ≥1024×1024) to `assets/source-logo.png`.
- [ ] `npm install` (adds `sharp`), then `npm run generate:assets`.
  - Produces `icon.png`, `adaptive-icon.png`, `splash.png`, `favicon.png`
    (bundled by the app) plus `playstore-icon.png` (512×512) and
    `feature-graphic.png` (1024×500) for the listing.
- [ ] Capture **≥2 phone screenshots** (1080×1920 or similar) from a running build
      — e.g. Home, Workout session, Nutrition, Progress.

## 2. Configure the build

- [ ] Fill Supabase keys in `eas.json` (all 3 profiles) **or** as EAS secrets:
  ```bash
  eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value https://YOUR-ref.supabase.co
  eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value YOUR-anon-key
  ```
- [ ] Apply DB migrations to your **production** Supabase project (`supabase db push` or SQL editor).
- [ ] Deploy the account-deletion function: `supabase functions deploy delete-account`.
- [ ] In Supabase **Auth → Email**, turn **Confirm email = ON** for production.
- [ ] `app.json` → `android.package` is `com.sculptix.app` (permanent once published).

## 3. Build the release bundle

```bash
eas build --platform android --profile production
```

- Choose **"Let EAS manage credentials"** (generates your upload keystore; Google
  Play App Signing protects the release key).
- Output: a signed **`.aab`**. `appVersionSource: remote` + `autoIncrement` manage
  `versionCode` automatically.

## 4. Create the app in Play Console

Complete every section marked required:

### Store listing
- **App name:** `Sculptix`
- **Short description (≤80 chars):**
  `Sculpt your dream physique with smart workouts, nutrition & progress tracking.`
- **Full description:** see `STORE_LISTING_COPY` below.
- **App icon:** `assets/playstore-icon.png` (512×512)
- **Feature graphic:** `assets/feature-graphic.png` (1024×500)
- **Phone screenshots:** the 2–8 you captured
- **Category:** Health & Fitness
- **Privacy policy URL:** the hosted `docs/PRIVACY_POLICY.md` (required)

### App content (Policy)
- [ ] **Privacy policy** URL added.
- [ ] **Data safety** form — answers below (must match the privacy policy).
- [ ] **Account deletion** — declare deletion is available **in-app**
      (Settings → Delete account) and provide a deletion request URL/email
      (your hosted privacy policy includes both).
- [ ] **Content rating** questionnaire — fitness app, no objectionable content →
      expect "Everyone".
- [ ] **Target audience** — 13+ (not designed for children).
- [ ] **Ads** — declare **No ads** (this version has none).
- [ ] **Health apps** declaration — Sculptix uses only user-entered data and does
      **not** connect to Health Connect / Google Fit, so no health-permissions
      declaration is required. (If you add Health Connect later, you must complete it.)

## 5. Release

- [ ] Upload the `.aab` to **Internal testing** first; add your email as a tester; install and smoke-test sign-up → onboarding → workout → nutrition → delete account.
- [ ] Promote to **Production** (or use `eas submit -p android --profile production`
      after adding a Google Play service-account JSON as `play-service-account.json`).
- [ ] First production review typically takes a few hours to a few days.

---

## Data safety form — answers

Declare **Data is encrypted in transit** and **Users can request data deletion**.

| Data type | Collected | Shared | Purpose | Optional? |
| --------- | --------- | ------ | ------- | --------- |
| Email address | Yes | No | Account management | Required |
| Name | Yes | No | App functionality (personalisation) | Required |
| Health & fitness (workouts, weight, nutrition) | Yes | No | App functionality | Required |
| Photos (progress pictures) | Yes | No | App functionality | Optional |
| User IDs | Yes | No | Account management | Required |

- **Is all data encrypted in transit?** Yes.
- **Do you provide a way to request data deletion?** Yes — in-app and via email.
- **No data is sold or shared with third parties. No advertising or analytics SDKs.**

---

## STORE_LISTING_COPY (full description)

```
Sculptix is your personal physique coach — not just another calorie counter.

Pick the look you're training for and Sculptix builds a smart, personalised
training program around your goal, equipment, schedule and experience. Then it
helps you train it, track it, and progress toward the body you actually want.

WHAT YOU GET
• Choose your dream physique — V-Taper, Men's Physique, Classic, Athletic, Lean
  Model, Powerbuilding, Strength or Fat Loss.
• Smart program generation — sets, reps, rest and progression tuned to you. No AI
  gimmicks, just proven training principles.
• 100+ exercise library with instructions, common mistakes and alternatives.
• Guided workout sessions — log sets, weights and reps with a built-in rest timer.
• Workout history, personal records and volume trends.
• Nutrition tracking — search foods, add your own, and hit personalised calorie
  and macro targets.
• Body-weight tracking with clean trend charts.
• Progress photos with before/after comparison.
• Beautiful dark & light themes.

Your data is yours: private by design, and you can delete your account and all
data anytime from Settings.

Start sculpting your best physique today.
```

> Tip: keep the full description under 4000 characters (this is well within it).
