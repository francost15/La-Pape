import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CACHE_PREFIX = "offline_cache_";

interface CacheOptions {
  ttl?: number;
  key: string;
}

export function useOfflineCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = 24 * 60 * 60 * 1000
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  isOffline: boolean;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  const cacheKey = `${CACHE_PREFIX}${key}`;

  const load = async () => {
    try {
      setLoading(true);
      setError(null);

      const fresh = await fetcher();
      setData(fresh);
      setIsOffline(false);

      await AsyncStorage.setItem(
        cacheKey,
        JSON.stringify({
          data: fresh,
          timestamp: Date.now(),
        })
      );
    } catch (err) {
      setIsOffline(true);
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        const { data: cachedData, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < ttl) {
          setData(cachedData);
          return;
        }
      }
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [key]);

  return { data, loading, error, refetch: load, isOffline };
}
