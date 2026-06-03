# Sculptix — Ship a downloadable APK (before the Play Store)

This produces a **release-signed `.apk`** anyone can download and install
directly (sideload), with a shareable link + QR from EAS — no Play Store needed.

> The Play Store needs an `.aab`; direct download needs an `.apk`. The
> **`preview`** profile in [`eas.json`](../eas.json) is configured to output an
> installable APK. The Play Store path (`production` → `.aab`) is unchanged.

---

## One-time setup

1. **Backend** — create a Supabase project and run [`supabase/setup.sql`](../supabase/setup.sql)
   in the SQL Editor (see the README). Deploy the delete-account function if you want
   account deletion in this build too:
   ```bash
   supabase functions deploy delete-account
   ```

2. **Give the cloud build your Supabase keys.** EAS builds in the cloud and does
   **not** read your local `.env`. Put the keys in [`eas.json`](../eas.json) under the
   `preview` (and `production`) profile's `env` — the anon key is public, so this is safe:
   ```jsonc
   "preview": {
     "distribution": "internal",
     "android": { "buildType": "apk" },
     "env": {
       "EXPO_PUBLIC_SUPABASE_URL": "https://YOUR-ref.supabase.co",
       "EXPO_PUBLIC_SUPABASE_ANON_KEY": "eyJhbGci...",
       "EXPO_PUBLIC_EXERCISE_MEDIA_BASE": ""
     }
   }
   ```
   (Prefer not to commit them? Use `eas env:create` / EAS secrets instead.)

3. **Tooling**
   ```bash
   npm i -g eas-cli
   eas login
   ```

4. **Icons** — make sure you've run `npm run generate:assets` (done ✓).

---

## Build the APK

```bash
eas build --platform android --profile preview
```

- First run asks about Android credentials → choose **"Let EAS manage credentials"**
  (generates a keystore). **Use the same keystore for every future build** so updates
  install over the existing app instead of erroring.
- The build runs in the cloud (~10–20 min on the free tier).
- When it finishes, EAS prints a **download URL + QR code** (also in the
  [Expo dashboard](https://expo.dev) → your project → Builds).

## Install it

- **On a phone:** open the link (or scan the QR), download the `.apk`, tap to install.
  Android will ask to allow "Install unknown apps" for your browser/files app — allow it.
- **Share:** send anyone the build URL; they download + install the same way.

---

## Pushing updates to the downloadable APK

A sideloaded APK won't auto-update. Two options:

- **Native/any change:** re-run `eas build -p android --profile preview` and reshare the link.
- **JS-only changes (optional, no rebuild):** set up [EAS Update](https://docs.expo.dev/eas-update/introduction/)
  so installed apps fetch new JS over the air:
  ```bash
  eas update:configure
  eas update --branch preview --message "what changed"
  ```

---

## Versioning

`eas.json` uses `appVersionSource: "remote"` with `autoIncrement`, so EAS bumps the
Android `versionCode` automatically each build. Bump the user-facing version in
[`app.json`](../app.json) (`expo.version`) when you cut a notable release.
```
