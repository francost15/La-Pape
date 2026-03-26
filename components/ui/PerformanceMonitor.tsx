import React, { useState, useEffect, useRef } from "react";
import { View, Text, Pressable } from "react-native";

interface PerformanceMetrics {
  fps: number;
  memory?: number;
  jsThreadTime?: number;
  timestamp: number;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const lastTime = useRef(performance.now());
  const frames = useRef(0);

  useEffect(() => {
    if (!isVisible) return;

    const measure = () => {
      const now = performance.now();
      frames.current++;

      if (now - lastTime.current >= 1000) {
        const fps = Math.round((frames.current * 1000) / (now - lastTime.current));
        setMetrics((m) => [...m.slice(-60), { fps, timestamp: now }]);
        frames.current = 0;
        lastTime.current = now;
      }

      requestAnimationFrame(measure);
    };

    const rafId = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(rafId);
  }, [isVisible]);

  const avgFps =
    metrics.length > 0 ? Math.round(metrics.reduce((a, m) => a + m.fps, 0) / metrics.length) : 0;

  const minFps = metrics.length > 0 ? Math.min(...metrics.map((m) => m.fps)) : 0;

  const maxFps = metrics.length > 0 ? Math.max(...metrics.map((m) => m.fps)) : 0;

  if (!isVisible) {
    return (
      <Pressable
        onPress={() => setIsVisible(true)}
        className="absolute top-4 right-4 rounded-full bg-black/70 px-3 py-1.5"
      >
        <Text className="font-mono text-xs text-white">FPS</Text>
      </Pressable>
    );
  }

  return (
    <View className="absolute top-4 right-4 w-40 rounded-xl bg-black/80 p-3">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-xs font-bold text-white">Performance</Text>
        <Pressable onPress={() => setIsVisible(false)}>
          <Text className="text-xs text-gray-400">✕</Text>
        </Pressable>
      </View>

      <View className="gap-1">
        <View className="flex-row justify-between">
          <Text className="text-xs text-gray-400">Avg</Text>
          <Text
            className={`font-mono text-xs ${avgFps >= 50 ? "text-green-400" : avgFps >= 30 ? "text-yellow-400" : "text-red-400"}`}
          >
            {avgFps} fps
          </Text>
        </View>

        <View className="flex-row justify-between">
          <Text className="text-xs text-gray-400">Min</Text>
          <Text
            className={`font-mono text-xs ${minFps >= 50 ? "text-green-400" : minFps >= 30 ? "text-yellow-400" : "text-red-400"}`}
          >
            {minFps} fps
          </Text>
        </View>

        <View className="flex-row justify-between">
          <Text className="text-xs text-gray-400">Max</Text>
          <Text className="font-mono text-xs text-gray-300">{maxFps} fps</Text>
        </View>
      </View>

      <View className="mt-2 h-10 flex-row items-end gap-0.5">
        {metrics.slice(-20).map((m, i) => (
          <View
            key={i}
            className={`flex-1 rounded-sm ${
              m.fps >= 50 ? "bg-green-500" : m.fps >= 30 ? "bg-yellow-500" : "bg-red-500"
            }`}
            style={{ height: `${(m.fps / 60) * 100}%` }}
          />
        ))}
      </View>
    </View>
  );
}
