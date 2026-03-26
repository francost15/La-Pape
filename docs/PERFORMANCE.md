# Performance Profiling

Tools for measuring and optimizing performance in La Pape app.

## PerformanceMonitor

Real-time FPS monitor that can be toggled in development mode.

### Usage

```typescript
import { PerformanceMonitor } from '@/components/ui/PerformanceMonitor';

function App() {
  return (
    <>
      {/* Your app content */}
      {__DEV__ && <PerformanceMonitor />}
    </>
  );
}
```

### Metrics

- **Avg FPS**: Average frames per second over the measurement period
- **Min FPS**: Minimum FPS recorded (good indicator of jank)
- **Max FPS**: Maximum FPS recorded
- **Bar Chart**: Visual representation of last 20 FPS readings

### Interpreting Metrics

| FPS Range | Status     | Color  |
| --------- | ---------- | ------ |
| 50-60     | Excellent  | Green  |
| 30-49     | Acceptable | Yellow |
| <30       | Poor       | Red    |

### Target Benchmarks

| Metric      | Target    | Notes                          |
| ----------- | --------- | ------------------------------ |
| FPS         | >= 50     | Below 30 indicates jank        |
| Frame Time  | < 16.67ms | For 60fps rendering            |
| Mount Time  | < 100ms   | Component should mount quickly |
| List Scroll | 60fps     | No dropped frames in FlatList  |

## Profiler Hook

Track component mount/update/unmount times.

### Usage

```typescript
import { useProfile } from '@/lib/utils/profiler';

function MyComponent() {
  const { onRender, getMeasurements } = useProfile('MyComponent');

  onRender();

  return <View>...</View>;
}
```

### Access All Measurements

```typescript
import { getAllMeasurements, clearMeasurements } from "@/lib/utils/profiler";

// Get all recorded measurements
const measurements = getAllMeasurements();

// Clear measurements when needed
clearMeasurements();
```

## PerformanceReport Component

Display aggregated performance data.

```typescript
import { PerformanceReport } from '@/components/ui/PerformanceReport';

// Add to settings or debug screen
<PerformanceReport />
```

## Benchmarks

Run performance benchmarks to track app performance over time.

### Adding Benchmarks

```typescript
import { registerBenchmark } from "@/scripts/benchmark";

registerBenchmark("Render products list", async () => {
  const start = performance.now();
  // Perform benchmark operation
  await renderProducts();
  return performance.now() - start;
});
```

### Running Benchmarks

```bash
npx ts-node scripts/benchmark.ts
```

## Common Performance Issues

### 1. Re-render Storms

**Symptom**: FPS drops to 0 briefly, then recovers.

**Solutions**:

- Use `React.memo()` for expensive components
- Implement `useMemo` / `useCallback` for computed values
- Split large lists with `FlatList` and `windowSize`

### 2. Large List Performance

**Symptom**: Scrolling stutters in lists.

**Solutions**:

- Use `getItemLayout` for fixed-height items
- Implement `keyExtractor`
- Use `removeClippedSubviews` (Android)
- Limit `initialNumToRender`

### 3. State Update Cascades

**Symptom**: Multiple frames drop when triggering an action.

**Solutions**:

- Batch state updates with `unstable_batchedUpdates`
- Use Zustand's `set` with function form for dependent state
- Consider using `useDeferredValue` for non-urgent updates

### 4. Bundle Size Impact

**Symptom**: Slow app startup, especially on Android.

**Solutions**:

- Enable Hermes engine
- Use `expo-optimize` to compress assets
- Lazy load screens with `React.lazy` / dynamic imports

## Profiling Tools

### React DevTools

1. Install React DevTools browser extension
2. Use Profiler panel to record and analyze renders
3. Check "Highlight updates" to spot unnecessary re-renders

### Flipper (Android)

1. Install Flipper desktop app
2. Enable Hermes debugging in your build
3. Use "Layout Inspector" and "Network Inspector"

### Performance Monitor

The `PerformanceMonitor` component provides quick visual feedback:

- Green bars: Good performance (50+ fps)
- Yellow bars: Moderate (30-49 fps)
- Red bars: Poor (<30 fps)

## Performance Checklist

- [ ] Monitor FPS during normal usage
- [ ] Run benchmarks after major changes
- [ ] Profile before/after optimization work
- [ ] Test on low-end devices (older Android)
- [ ] Check bundle size with `npx expo export:Analyze`
