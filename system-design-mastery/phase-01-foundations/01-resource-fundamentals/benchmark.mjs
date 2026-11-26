import { performance } from "node:perf_hooks";

const BASE_URL = "http://127.0.0.1:3000";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function request(endpoint) {
  const start = performance.now();

  const response = await fetch(`${BASE_URL}${endpoint}`);

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  const data = await response.json();

  return {
    endpoint,
    duration: `${(performance.now() - start).toFixed(2)} ms`,
    data,
  };
}

async function experiment(endpoint) {
  console.log(`\n=== Testing ${endpoint} ===`);

  const longRequest = request(endpoint);

  await sleep(200);

  const healthRequest = request("/health");

  const results = await Promise.all([longRequest, healthRequest]);

  console.table(
    results.map(({ endpoint, duration }) => ({
      endpoint,
      duration,
    })),
  );
}

async function main() {
  console.log("\n=== BASELINE ===");

  console.log(await request("/health"));

  await experiment("/cpu");

  await experiment("/io");

  await experiment("/worker");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
