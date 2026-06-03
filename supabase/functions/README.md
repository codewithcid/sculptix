# Supabase Edge Functions

## delete-account

Permanently deletes the signed-in user's account + all data (Play/App Store
requirement). The mobile app calls it via `authService.deleteAccount()`.

### Deploy

```bash
supabase functions deploy delete-account
```

No secrets to configure — `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` and
`SUPABASE_ANON_KEY` are injected into deployed functions automatically.

> The function runs on **Deno** (not the React Native bundle) and is excluded
> from the app's `tsconfig.json`. The `https://esm.sh/...` import is normal for
> Edge Functions.

### Verify

```bash
# while signed in on a test account, from the app:  Settings → Delete account
# or manually with a user access token:
curl -X POST "https://YOUR-ref.functions.supabase.co/delete-account" \
  -H "Authorization: Bearer USER_ACCESS_TOKEN"
```
