import { spawn, spawnSync } from "node:child_process";
import http from "node:http";

const HOST = "127.0.0.1";
const PORT = 3100;
const BASE_URL = `http://${HOST}:${PORT}`;

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: false,
  });

  return result.status ?? 1;
}

function waitForServer(timeoutMs = 120_000) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    function check() {
      const request = http.get(BASE_URL, (response) => {
        response.resume();
        resolve();
      });

      request.on("error", () => {
        if (Date.now() - startedAt > timeoutMs) {
          reject(new Error(`Timed out waiting for ${BASE_URL}`));
          return;
        }

        setTimeout(check, 250);
      });
    }

    check();
  });
}

function stopServer(server) {
  if (server.exitCode !== null || server.signalCode) {
    return;
  }

  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(server.pid), "/t", "/f"], {
      stdio: "ignore",
    });
    return;
  }

  server.kill("SIGTERM");
}

const nextCli = "node_modules/next/dist/bin/next";
const playwrightCli = "node_modules/@playwright/test/cli.js";

const buildStatus = run(process.execPath, [nextCli, "build"]);

if (buildStatus !== 0) {
  process.exit(buildStatus);
}

const server = spawn(
  process.execPath,
  [nextCli, "start", "--hostname", HOST, "--port", String(PORT)],
  {
    stdio: "inherit",
    shell: false,
  },
);

try {
  await waitForServer();
  const testStatus = run(process.execPath, [playwrightCli, "test"]);
  stopServer(server);
  process.exit(testStatus);
} catch (error) {
  console.error(error);
  stopServer(server);
  process.exit(1);
}
