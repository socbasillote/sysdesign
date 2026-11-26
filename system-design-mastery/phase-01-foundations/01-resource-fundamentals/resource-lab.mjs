import process from "node:process";
import os from "node:os";
import path from "node:path";

import { performance } from "node:perf_hooks";

import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";

function printMemory(label) {
  const memory = process.memoryUsage();

  console.log(`\n=== ${label} ===`);

  console.table(
    Object.fromEntries(
      Object.entries(memory).map(([key, value]) => [
        key,
        `${(value / 1024 ** 2).toFixed(2)} MiB`,
      ]),
    ),
  );
}

async function measure(label, operation) {
  const start = performance.now();
  const cpuStart = process.cpuUsage();

  const result = await operation();

  const duration = performance.now() - start;
  const cpu = process.cpuUsage(cpuStart);

  console.table({
    operation: label,
    elapsedTime: `${duration.toFixed(2)} ms`,
    cpuUserTime: `${(cpu.user / 1000).toFixed(2)} ms`,
    cpuSystemTime: `${(cpu.system / 1000).toFixed(2)} ms`,
  });

  return result;
}

async function main() {
  printMemory("INITIAL MEMORY");

  // Experiment 1: CPU-intensive computation.

  await measure("CPU calculation", () => {
    let result = 0;

    for (let i = 0; i < 100_000_000; i++) {
      result += Math.sqrt(i);
    }

    return result;
  });

  // Experiment 2: Memory allocation.

  const buffer = await measure("Allocate 32 MiB", () =>
    Buffer.alloc(32 * 1024 * 1024, 1),
  );

  printMemory("AFTER MEMORY ALLOCATION");

  // Experiment 3: File I/O.

  const directory = await mkdtemp(path.join(os.tmpdir(), "system-design-"));

  const filePath = path.join(directory, "test.bin");

  try {
    await measure("Write file", () => writeFile(filePath, buffer));

    const file = await measure("Read file", () => readFile(filePath));

    console.log("Bytes read:", file.length);

    printMemory("AFTER FILE READ");
  } finally {
    await rm(directory, {
      recursive: true,
      force: true,
    });
  }

  // Experiment 4: Simulated asynchronous waiting.

  await measure(
    "Asynchronous wait",
    () => new Promise((resolve) => setTimeout(resolve, 2000)),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
