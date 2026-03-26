import { useRef, useEffect } from "react";

interface ProfilerMeasurement {
  id: string;
  phases: {
    mount: number;
    update: number;
    unmount: number;
  };
  renders: number;
}

const measurements = new Map<string, ProfilerMeasurement>();

export function useProfile(id: string) {
  const renders = useRef(0);

  useEffect(() => {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      const existing = measurements.get(id) || {
        id,
        phases: { mount: 0, update: 0, unmount: 0 },
        renders: 0,
      };
      existing.phases.mount += duration;
      existing.renders++;
      measurements.set(id, existing);

      console.log(`[Profile] ${id} mounted in ${duration.toFixed(2)}ms`);
    };
  }, [id]);

  return {
    onRender: () => {
      renders.current++;
    },
    getMeasurements: () => measurements.get(id),
  };
}

export function getAllMeasurements() {
  return Object.fromEntries(measurements);
}

export function clearMeasurements() {
  measurements.clear();
}
