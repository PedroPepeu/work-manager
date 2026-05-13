import { spawnSync } from "node:child_process";

const maxAttempts = 20;
const retryDelayMs = 1000;
const transientErrors = [
  "ECONNRESET",
  "ECONNREFUSED",
  "Connection terminated",
  "the database system is starting up",
  "database system is starting up"
];

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
  const result = spawnSync("pnpm", ["--filter", "@work-manager/api", "db:migrate"], {
    encoding: "utf8"
  });

  process.stdout.write(result.stdout ?? "");
  process.stderr.write(result.stderr ?? "");

  if (result.status === 0) {
    process.exit(0);
  }

  const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
  const shouldRetry = transientErrors.some((message) => output.includes(message));

  if (!shouldRetry || attempt === maxAttempts) {
    process.exit(result.status ?? 1);
  }

  console.log(`Database is not ready yet. Retrying migration (${attempt}/${maxAttempts})...`);
  sleep(retryDelayMs);
}
