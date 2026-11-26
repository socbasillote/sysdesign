import http from "node:http";
import { performance } from "node:perf_hooks";
import { Worker } from "node:worker_threads";

const PORT = 3000;

let workerBusy = false;

function runCPUWorker(duration) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./cpu-worker.mjs", import.meta.url), {
      workerData: {
        duration,
      },
    });

    worker.once("message", resolve);

    worker.once("error", reject);

    worker.once("exit", (code) => {
      reject(
        new Error(`Worker exited before returning a result (code ${code})`),
      );
    });
  });
}

function blockCPU(duration) {
  const start = performance.now();

  let operations = 0;

  while (performance.now() - start < duration) {
    operations++;
  }

  return operations;
}

function simulateAsyncWait(duration) {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader("Content-Type", "application/json");

  if (req.url === "/health") {
    return res.end(
      JSON.stringify({
        status: "healthy",
      }),
    );
  }

  if (req.url === "/cpu") {
    const start = performance.now();

    const operations = blockCPU(2000);

    return res.end(
      JSON.stringify({
        type: "CPU-bound",
        operations,
        duration: performance.now() - start,
      }),
    );
  }

  if (req.url === "/io") {
    const start = performance.now();

    await simulateAsyncWait(2000);

    return res.end(
      JSON.stringify({
        type: "Simulated I/O wait",
        duration: performance.now() - start,
      }),
    );
  }

  if (req.url === "/worker") {
    if (workerBusy) {
      res.statusCode = 503;

      return res.end(
        JSON.stringify({
          message: "Worker is busy",
        }),
      );
    }

    workerBusy = true;

    try {
      const result = await runCPUWorker(2000);

      return res.end(JSON.stringify(result));
    } catch (error) {
      console.error(error);

      res.statusCode = 500;

      return res.end(
        JSON.stringify({
          message: "Worker execution failed",
        }),
      );
    } finally {
      workerBusy = false;
    }
  }

  res.statusCode = 404;

  res.end(
    JSON.stringify({
      message: "Route not found",
    }),
  );
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Server running at http://127.0.0.1:${PORT}`);
});
