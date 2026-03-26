import React from "react";
import { View, Text, ScrollView } from "react-native";
import { getAllMeasurements } from "@/lib/utils/profiler";

export function PerformanceReport() {
  const measurements = getAllMeasurements();

  return (
    <ScrollView className="p-4">
      <Text className="mb-4 text-lg font-bold">Performance Report</Text>

      {Object.entries(measurements).map(([id, data]) => (
        <View key={id} className="mb-2 rounded-lg bg-gray-100 p-3 dark:bg-neutral-800">
          <Text className="font-mono text-sm">{id}</Text>
          <Text className="text-xs text-gray-500">
            Renders: {data.renders} | Mount: {data.phases.mount.toFixed(2)}ms
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
