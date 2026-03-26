import { useState, useEffect } from "react";
import { featureFlags } from "@/lib/services/feature-flags";
import type { FeatureFlags } from "@/lib/services/feature-flags";

export function useFeatureFlag(flag: keyof FeatureFlags): boolean {
  const [enabled, setEnabled] = useState(() => featureFlags.isEnabled(flag));

  useEffect(() => {
    const interval = setInterval(() => {
      setEnabled(featureFlags.isEnabled(flag));
    }, 5000);

    return () => clearInterval(interval);
  }, [flag]);

  return enabled;
}
