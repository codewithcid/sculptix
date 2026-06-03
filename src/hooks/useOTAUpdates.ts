import { useEffect } from 'react';
import * as Updates from 'expo-updates';

/**
 * Check for an over-the-air (EAS Update) JS bundle on launch and, if one is
 * available, fetch and apply it. No-ops in development and in Expo Go
 * (`Updates.isEnabled` is false there), so it only runs in real builds.
 *
 * Configure once with `eas update:configure`, then publish updates with
 * `eas update --branch <channel>`. See docs/DISTRIBUTE_APK.md.
 */
export function useOTAUpdates() {
  useEffect(() => {
    if (__DEV__ || !Updates.isEnabled) return;

    let cancelled = false;
    (async () => {
      try {
        const result = await Updates.checkForUpdateAsync();
        if (cancelled || !result.isAvailable) return;
        await Updates.fetchUpdateAsync();
        if (cancelled) return;
        await Updates.reloadAsync();
      } catch {
        // Offline or update service unavailable — keep running the current bundle.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);
}
