interface Benchmark {
  name: string;
  fn: () => Promise<number> | number;
}

const benchmarks: Benchmark[] = [];

export function registerBenchmark(name: string, fn: () => Promise<number> | number) {
  benchmarks.push({ name, fn });
}

export async function runBenchmarks(): Promise<void> {
  console.log("Running benchmarks...\n");

  for (const bench of benchmarks) {
    const iterations = 10;
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const time = await bench.fn();
      times.push(time);
    }

    const avg = times.reduce((a, b) => a + b, 0) / iterations;
    const min = Math.min(...times);
    const max = Math.max(...times);

    console.log(`${bench.name}:`);
    console.log(
      `  Avg: ${avg.toFixed(2)}ms | Min: ${min.toFixed(2)}ms | Max: ${max.toFixed(2)}ms\n`
    );
  }
}

export function getBenchmarks() {
  return benchmarks.map((b) => b.name);
}
