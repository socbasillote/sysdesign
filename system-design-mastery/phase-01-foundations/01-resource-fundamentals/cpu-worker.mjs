import { performance } from "node:perf_hooks";

import { parentPort, workerData, threadId } from "node:worker_threads";

const start = performance.now();

let operations = 0;

while (performance.now() - start < workerData.duration) {
  operations++;
}

parentPort.postMessage({
  type: "Worker thread",
  threadId,
  operations,
  duration: performance.now() - start,
});
