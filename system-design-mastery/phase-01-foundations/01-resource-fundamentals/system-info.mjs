import os from "node:os";
import process from "node:process";

const toGB = (bytes) => {
  return (bytes / 1024 ** 3).toFixed(2);
};

const toMB = (bytes) => {
  return (bytes / 1024 ** 2).toFixed(2);
};

console.log("\n=== SYSTEM INFORMATION ===\n");

console.table({
  platform: os.platform(),
  architecture: os.arch(),
  cpuModel: os.cpus()[0]?.model,
  logicalCPUs: os.cpus().length,
  availableParallelism: os.availableParallelism(),
  totalMemory: `${toGB(os.totalmem())} GiB`,
  freeMemory: `${toGB(os.freemem())} GiB`,
  nodeVersion: process.version,
});

console.log("\n=== PROCESS MEMORY ===\n");

const memory = process.memoryUsage();

console.table({
  rss: `${toMB(memory.rss)} MiB`,
  heapTotal: `${toMB(memory.heapTotal)} MiB`,
  heapUsed: `${toMB(memory.heapUsed)} MiB`,
  external: `${toMB(memory.external)} MiB`,
  arrayBuffers: `${toMB(memory.arrayBuffers)} MiB`,
});
