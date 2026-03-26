import AsyncStorage from "@react-native-async-storage/async-storage";

export interface FeatureFlags {
  showOnboarding: boolean;
  showOnboardingHints: boolean;
  enableDarkMode: boolean;
  enableRefund: boolean;
  enableQrScanner: boolean;
  enablePdfReceipt: boolean;
  enablePagination: boolean;
  enableOfflineMode: boolean;
  enableFlashList: boolean;
}

const DEFAULT_FLAGS: FeatureFlags = {
  showOnboarding: true,
  showOnboardingHints: true,
  enableDarkMode: true,
  enableRefund: true,
  enableQrScanner: true,
  enablePdfReceipt: true,
  enablePagination: true,
  enableOfflineMode: true,
  enableFlashList: true,
};

class FeatureFlagService {
  private flags: FeatureFlags = DEFAULT_FLAGS;
  private storageKey = "feature_flags";

  async init() {
    try {
      const stored = await AsyncStorage.getItem(this.storageKey);
      if (stored) {
        this.flags = { ...DEFAULT_FLAGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn("Failed to load feature flags:", e);
    }
  }

  isEnabled(key: keyof FeatureFlags): boolean {
    return this.flags[key] ?? false;
  }

  async setFlag(key: keyof FeatureFlags, value: boolean) {
    this.flags[key] = value;
    await AsyncStorage.setItem(this.storageKey, JSON.stringify(this.flags));
  }

  async reset() {
    this.flags = DEFAULT_FLAGS;
    await AsyncStorage.removeItem(this.storageKey);
  }

  getAllFlags(): FeatureFlags {
    return { ...this.flags };
  }
}

export const featureFlags = new FeatureFlagService();
